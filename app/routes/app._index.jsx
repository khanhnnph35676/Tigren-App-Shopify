import {
  Page, LegacyStack, LegacyCard, Grid, Text, Button
} from "@shopify/polaris";
import CustomSidebar from "../components/customSidebar.jsx";
import '../components/css/home.css';
import {Link} from "@remix-run/react";

export default function HomPage() {
  return (
    <Page fullWidth>
      <LegacyStack wrap={false}>

        <LegacyStack.Item>
          <CustomSidebar/>
        </LegacyStack.Item>
        <LegacyStack.Item fill>
          <div className='head-line'>
            <LegacyStack>
              <Text variant="heading3xl" as="h2"> Home Page </Text>
            </LegacyStack>
          </div>
          <Grid>
            <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}} className="grid">
              <LegacyCard title="Customer" sectioned>
                <p>Open view Customer</p>
                <br/>
                <Link to="/app/customer"><Button>Open</Button></Link>
              </LegacyCard>
            </Grid.Cell>
            {/*<Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
            {/*  <LegacyCard title="Orders" sectioned>*/}
            {/*    <p>Open view order</p>*/}
            {/*    <br/>*/}
            {/*    <Button><Link to="/app/order">Open</Link></Button>*/}
            {/*  </LegacyCard>*/}
            {/*</Grid.Cell>*/}
          </Grid>
        </LegacyStack.Item>
      </LegacyStack>
    </Page>

  );
}
