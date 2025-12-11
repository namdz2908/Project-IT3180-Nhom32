/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/resident_management";
import Billing from "layouts/billing";
import Apartment from "layouts/apartment";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import PaymentComplete from "layouts/payment";
import BillingTable from "layouts/billing_management";
import NotificationTable from "layouts/notification_management";
import UserNotificationPage from "layouts/notification";
import UserContributionTable from "layouts/contribution";
import { jwtDecode } from "jwt-decode";

// @mui icons
import Icon from "@mui/material/Icon";

const token = localStorage.getItem("token");
let userRole = null;
if (token) {
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role || null;
  } catch {
    userRole = null;
  }
}

const routes = [
  {
    type: "collapse",
    name: "Welcome",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Resident Management",
    key: "tables",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/manage/resident",
    component:
      userRole === "USER" ? (
        () => (
          <div style={{ padding: 32, fontSize: 24 }}>
            You don&apos;t have permission to access this
          </div>
        )
      ) : (
        <Tables />
      ),
    hidden: userRole === "USER",
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Billing Management",
    key: "fee",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/manage/billing",
    component:
      userRole === "USER" ? (
        () => (
          <div style={{ padding: 32, fontSize: 24 }}>
            You don&apos;t have permission to access this
          </div>
        )
      ) : (
        <BillingTable />
      ), // Sử dụng component mới cho bảng Fee
    hidden: userRole === "USER",
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Notification Management",
    key: "notification",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/manage/notification",
    component:
      userRole === "USER" ? (
        () => (
          <div style={{ padding: 32, fontSize: 24 }}>
            You don&apos;t have permission to access this
          </div>
        )
      ) : (
        <NotificationTable />
      ), // Sử dụng component mới cho bảng Fee
    hidden: userRole === "USER",
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Apartment",
    key: "apartment",
    icon: <Icon fontSize="small">apartment</Icon>,
    route: "/apartment/:apartmentId",
    // The route is dynamic and will be replaced with the apartment id
    component: <Apartment />,
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Notification",
    key: "usernotification",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notification/:id",
    // The route is dynamic and will be replaced with the user id
    component: <UserNotificationPage />,
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile/:id",
    // The route is dynamic and will be replaced with the user id
    component: <Profile />,
    hidden: !token,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    // Hide from sidebar if logged in
    hidden: token,
  },
  {
    key: "payment-complete",
    route: "/payment/complete/:paymentToken",
    component: <PaymentComplete />,
  },
  {
    type: "collapse",
    name: "Contribution",
    key: "contribution",
    icon: <Icon fontSize="small">monetization_on</Icon>,
    route: "/contribution",
    component: <UserContributionTable />,
    hidden: !token,
  },
  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   icon: <Icon fontSize="small">assignment</Icon>,
  //   route: "/authentication/sign-up",
  //   component: <SignUp />,
  // },
];

export default routes;
