import {
  reactExtension, InlineStack, TextField, Button, BlockStack,
  Text, useSubtotalAmount, useCustomer
} from "@shopify/ui-extensions-react/checkout";
import {useState, useEffect, useCallback} from 'react';

const SHOP_NAME = "quickstart-594cbb44.myshopify.com";


export default reactExtension("purchase.checkout.cart-line-list.render-after", () => <Extension/>);

async function fetchCustomerDataById(customerId) {
  const query = `
    query ($id: ID!) {
      customer(id: $id) {
        metafield(namespace: "custom", key: "point") {
          value
        }
      }
    }
  `;
  const response = await fetch(
    `https://${SHOP_NAME}/api/2024-07/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": API_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: {id: customerId},
      }),
    }
  );
  const responseData = await response.json();
  console.log(responseData)
}

function Extension() {
  const [points, setPoints] = useState('0');
  const [value, setValue] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const customer = useCustomer();

  // Lấy ID của khách hàng
  const customerId = customer?.id;

  const handleChange = useCallback((newValue) => setValue(newValue), []);
  const amountCheckout = useSubtotalAmount();

  useEffect(() => {
    if (amountCheckout && amountCheckout.amount > 10) {
      const calculatedPoints = amountCheckout.amount / 10;
      setPoints(calculatedPoints.toString());
    }
  }, [amountCheckout]);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (customerId) { // Kiểm tra nếu có ID của khách hàng
        const customerData = await fetchCustomerDataById(customerId);
        setCustomerInfo(customerData);
      }
    };

    fetchCustomerInfo();
  }, [customerId]);

  return (
    <BlockStack>
      <InlineStack>
        <TextField
          label="Total Point"
          disabled autoComplete="off"
          value={points}
        />
        <TextField
          label="Received Point"
          disabled autoComplete="off"
          value={points}
        />
      </InlineStack>
      <InlineStack alignment="center" spacing="tight">
        <TextField
          label="Point"
          value={value}
          onChange={handleChange}
          autoComplete="off"
        />
        <Button>Apply</Button>
      </InlineStack>

      {customerInfo ? (
        <>
          <Text>Customer ID: {customerInfo.id}</Text>
          {customerInfo.metafield && (
            <Text>Reward Points: {customerInfo.metafield.value || '0'}</Text>
          )}
        </>
      ) : (
        <Text>Customer information is not available</Text>
      )}
    </BlockStack>
  );
}
