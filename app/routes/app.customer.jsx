import {
  Page, LegacyCard, DataTable, Text, LegacyStack, Icon, Button
} from '@shopify/polaris';
import {
  ViewIcon
} from "@shopify/polaris-icons";
import React, {useState} from 'react';
import {useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import {authenticate} from "../shopify.server";
import '../components/css/customer.css'
import CustomSidebar from "../components/customSidebar.jsx";
import {Link} from "@remix-run/react";

export const loader = async ({request}) => {
  const {admin} = await authenticate.admin(request);
  const response = await admin.graphql(`
    {
      customers(first: 100) {
        edges {
          node {
            id
            phone
            addresses {
              address1
              city
              country
            }
            orders(first: 100) {
              nodes {
                name
              }
            }
            amountSpent {
              amount
              currencyCode
            }
            email
          }
        }
      }
    }
  `);
  const customerData = (await response.json()).data;
  return json({
    customers: customerData.customers.edges.map(edge => edge.node),
  });
};

export default function CustomerTable() {
  const {customers} = useLoaderData();
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(customers.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const displayedRows = customers.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map(customer => {
    const amountSpentInVND = parseFloat(customer.amountSpent.amount); // Chuyển đổi giá trị sang số
    const points = amountSpentInVND ? Math.floor(amountSpentInVND / 10) : 0; // Tính điểm

    return [
      <Link to={`/customers/${customer.id}`} className="custom-link">{customer.email}</Link>,
      customer.phone || 'N/A',
      customer.addresses.length > 0 ? customer.addresses[0].address1 : 'N/A',
      `${customer.orders.nodes.length} orders`,
      customer.amountSpent ? `${customer.amountSpent.amount} đ` : 'N/A',
      `${points} point`
    ];
  });

  return (
    <Page title="Customer List" fullWidth>
      <LegacyStack wrap={false}>
        <LegacyStack.Item>
          <CustomSidebar/>
        </LegacyStack.Item>
        <LegacyStack.Item fill>
          <div className='head-line'>
            <LegacyStack>
              <Text variant="heading3xl" as="h2"> List Customer </Text>
            </LegacyStack>
          </div>
          <LegacyCard>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
              ]}
              headings={[
                'Email',
                'Phone',
                'Address',
                'Orders',
                'Amount Spent',
                'Point',
              ]}
              rows={displayedRows}
            />
            <div className="pagination">
              <Button onClick={handlePreviousPage} disabled={currentPage === 0}>Previous</Button>
              <Text variant="bodyMd" as="span"> Page {currentPage + 1} of {totalPages} </Text>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>Next</Button>
            </div>
          </LegacyCard>
        </LegacyStack.Item>
      </LegacyStack>
    </Page>
  );
}
