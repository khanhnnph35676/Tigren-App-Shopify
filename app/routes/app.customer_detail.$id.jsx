import {
  Page, LegacyCard, DataTable, Text, LegacyStack, Icon, Button, Card, Layout, Grid, Box, TextField, Toast, Frame
} from '@shopify/polaris';
import React, {useState, useCallback, useEffect, useTransition} from 'react';
import {useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import '../components/css/customer.css';
import CustomSidebar from "../components/customSidebar.jsx";

export const loader = async ({request}) => {
  const {admin} = await authenticate.admin(request);
  const customerIdMatch = request.url.match(/customer_detail\/(\d+)/);
  const customerId = customerIdMatch ? customerIdMatch[1] : null;

  if (!customerId) {
    return json({customer: null});
  }

  const response = await admin.graphql(`
    {
      customer(id: "gid://shopify/Customer/${customerId}") {
        id
        firstName
        email
        phone
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
        createdAt
        updatedAt
        note
        verifiedEmail
        validEmailAddress
        tags
        lifetimeDuration
        defaultAddress {
          formattedArea
          address1
        }
        addresses {
          address1
        }
        image {
          src
        }
        metafield(namespace: "custom", key: "point") {
          value
        }
        canDelete
        orders(first: 100) {
          nodes {
            name
            netPaymentSet {
              presentmentMoney {
                amount
                currencyCode
              }
            }
            lineItems(first: 10) {
              edges {
                node {
                  id
                  image {
                    src
                  }
                  name
                  quantity
                  discountedUnitPriceSet {
                    presentmentMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  const customerData = await response.json();
  return json({
    customer: customerData.data.customer,
  });
};

export const action = async ({request}) => {
  const {admin} = await authenticate.admin(request);
  const formData = new URLSearchParams(await request.text());
  const customerId = formData.get('customerId');
  const value = formData.get('point');

  const response = await admin.graphql(`
    mutation {
      customerUpdate(input: {
        id: "${customerId}",
        metafields: [
          {namespace: "custom", key: "point", value: "${value}", type: "number_integer"}
        ]
      }) {
        customer {
          id
          metafield(namespace: "custom", key: "point") {
            value
          }
        }
        userErrors {
          message
          field
        }
      }
    }
  `);
  const result = await response.json();
};

export default function CustomerDetail() {
  const {customer} = useLoaderData();
  const [value, setValue] = useState('0');
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (customer.metafield && customer.metafield.value !== undefined) {
      setValue(customer.metafield.value);
    }
  }, [customer.metafield]);

  const handleChange = useCallback(
    (newValue) => setValue(newValue),
    [],
  );

  const handleSave = async () => {
    const formData = new URLSearchParams();
    formData.append('customerId', customer.id); // Lấy ID khách hàng
    formData.append('point', value);

    const response = await fetch(`/app/customer_detail/${customer.id.split("/").pop()};`, {
      method: 'POST',
      body: formData,
    });
    if ({response}) {
      setActive(true);
    }
  };
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const toastMarkup = active ? (
    <Toast content="Message: Succesfully update Cutomer" onDismiss={toggleActive} duration={4500}/>
  ) : null;
  return (
    <Frame>
      <Page
        fullWidth
        backAction={{content: 'Settings', url: '/app/customer'}}
        title="General"
        primaryAction={
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        }
      >
        {toastMarkup}
        <LegacyStack wrap={false}>
          <LegacyStack.Item>
            <CustomSidebar/>
          </LegacyStack.Item>
          <LegacyStack.Item fill>
            <Card>
              <div className='head-line'>
                <LegacyStack>
                  <Text variant="heading3xl" as="h2">Customer Detail</Text>
                </LegacyStack>
              </div>
              <Layout>
                <Layout.Section>
                  <Grid>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 8, xl: 8}}>
                      <LegacyStack alignment="center">
                        {customer.image && (
                          <Box>
                            <img
                              src={customer.image.src}
                              alt="Customer"
                              style={{maxWidth: '50px', borderRadius: '8px', margin: '10px'}}
                            />
                          </Box>
                        )}
                        <Text variant="heading2xl">{customer.email}</Text>
                      </LegacyStack>
                      <LegacyCard sectioned>
                        <Text variant="bodyMd">Phone: {customer.phone || 'N/A'}</Text>
                        <Text variant="bodyMd">Number of Orders: {customer.orders.nodes.length} orders</Text>
                        <Text variant="bodyMd">Amount
                          Spent: {customer.amountSpent.amount} {customer.amountSpent.currencyCode}</Text>
                        <Text variant="bodyMd">Created At: {new Date(customer.createdAt).toLocaleString()}</Text>
                        <Text variant="bodyMd">Updated At: {new Date(customer.updatedAt).toLocaleString()}</Text>
                        <Text variant="bodyMd">Notes: {customer.note || 'No notes available.'}</Text>
                        <Text
                          variant="bodyMd">Tags: {customer.tags.length ? customer.tags.join(', ') : 'No tags available.'}</Text>
                      </LegacyCard>
                      <LegacyCard sectioned>
                        <TextField
                          label="Point"
                          type="number"
                          value={value}
                          onChange={handleChange}
                          autoComplete="off"
                        />
                      </LegacyCard>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 4, xl: 4}}>
                      <LegacyCard title="Orders" sectioned>
                        <p>View a summary of your online store’s orders.</p>
                        <div className="show-order">
                          {customer.orders.nodes.map(order => (
                            <LegacyCard key={order.name} sectioned>
                              <Text variant="headingSm">{order.name}</Text>
                              <Text variant="bodyMd">
                                Total: {order.netPaymentSet.presentmentMoney.amount} {order.netPaymentSet.presentmentMoney.currencyCode}
                              </Text>
                              <LegacyStack>
                                {order.lineItems.edges.map(({node}) => (
                                  <LegacyStack.Item key={node.id} alignment="center">
                                    {node.image && (
                                      <img
                                        src={node.image.src}
                                        alt={node.name}
                                        style={{maxWidth: '30px', borderRadius: '4px', margin: '0 10px 0 0'}}
                                      />
                                    )}
                                    <Text variant="bodyMd">{node.name} (x{node.quantity})
                                      - {node.discountedUnitPriceSet.presentmentMoney.amount} {node.discountedUnitPriceSet.presentmentMoney.currencyCode}</Text>
                                  </LegacyStack.Item>
                                ))}
                              </LegacyStack>
                            </LegacyCard>
                          ))}
                        </div>
                      </LegacyCard>
                    </Grid.Cell>
                  </Grid>
                </Layout.Section>
              </Layout>
            </Card>
          </LegacyStack.Item>
        </LegacyStack>
      </Page>
    </Frame>
  );
}
