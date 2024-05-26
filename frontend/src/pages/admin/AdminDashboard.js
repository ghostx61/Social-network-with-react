import { useEffect, useState } from "react";
import classes from "./AdminDashboard.module.css";
import { useSelector } from "react-redux";
import sendRequest from "../../helper/sendRequest";

import { formatDate2, formatDate6 } from "../../helper/dataTransform";
import {
  NavLink,
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import LoadingSpinner from "../../Ui/LoadingSpinner";

const AdminDashboard = () => {
  const authData = useSelector((state) => state.auth);
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector((state) => state.auth.role === "admin");
  const token = localStorage.getItem("token");
  const location = useLocation();
  const history = useHistory();

  const [queryParamTab, setQueryParamTab] = useState(null);
  const [isTabLoading, setIsTabLoading] = useState(false);

  //Get page query param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newQueryParam = searchParams.get("tab");
    // console.log(newQueryParam);
    setQueryParamTab(newQueryParam);
    if (!newQueryParam) {
      history.replace("/admin?tab=users");
    }
  }, [history, location.search]);

  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    // get users
    const getUsers = async () => {
      setIsTabLoading(true);
      const [data, error] = await sendRequest({
        method: "GET",
        url: "/admin/user?select=fname,lname,username,email,createdAt",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (error) {
        console.log(error.message);
        return;
      }
      // console.log(data);
      setUsers([...data.data]);
      setIsTabLoading(false);
    };

    // get visitors
    const getVisitor = async () => {
      setIsTabLoading(true);
      const [response, error] = await sendRequest({
        method: "GET",
        url: "/admin/session",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (error) {
        console.log(error.message);
        return;
      }
      // console.log(data);
      setVisitors([...response.data]);
      console.log(response);
      setIsTabLoading(false);
    };

    if (queryParamTab === "users") {
      getUsers();
    }
    if (queryParamTab === "visitors") {
      getVisitor();
    }
  }, [queryParamTab]);

  const loadingSpinner = (
    <div className={`center ${classes["spinner-container"]}`}>
      <LoadingSpinner />
    </div>
  );

  const allUsersTab = (
    <table
      className="table table-striped table-bordered"
      style={{ width: "1500px" }}
    >
      <thead>
        <tr>
          <th scope="col" style={{ width: "40px" }}>
            ID
          </th>
          <th scope="col" style={{ width: "60px" }}>
            Name
          </th>
          <th scope="col" style={{ width: "60px" }}>
            Username
          </th>
          <th scope="col" style={{ width: "60px" }}>
            Joined on
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            {/* <th scope="row">1</th> */}
            <td>{user.id}</td>
            <td>{user.fname + " " + user.lname}</td>
            <td>{user.username}</td>
            <td>{formatDate6(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const allVisitorsTab = (
    <table
      className="table table-striped table-bordered"
      style={{ width: "1500px" }}
    >
      <thead>
        <tr>
          <th scope="col" style={{ width: "40px" }}>
            Session ID
          </th>
          <th scope="col" style={{ width: "60px" }}>
            Username
          </th>
          <th scope="col" style={{ width: "100px" }}>
            Date
          </th>
          <th scope="col" style={{ width: "60px" }}>
            Did Login
          </th>
          <th scope="col" style={{ width: "60px" }}>
            Did Signup
          </th>
        </tr>
      </thead>
      <tbody>
        {visitors.map((visitor) => (
          <tr key={visitor._id}>
            {/* <th scope="row">1</th> */}
            <td>{visitor._id}</td>
            <td>{visitor.username}</td>
            <td>{formatDate6(visitor.createdAt)}</td>
            <td className={visitor.didLogin ? "table-success" : ""}>
              {visitor.didLogin ? "Yes" : "No"}
            </td>
            <td className={visitor.didSignup ? "table-success" : ""}>
              {visitor.didSignup ? "Yes" : "No"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const navLinkActiveClass1 = (match, location) => {
    return location.search.includes("tab=users");
  };
  const navLinkActiveClass2 = (match, location) => {
    return location.search.includes("tab=visitors");
  };

  return (
    <div className={classes["container"]}>
      <h1>Admin Dashboard</h1>
      {/* tabs  */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <NavLink
            to="/admin?tab=users"
            isActive={navLinkActiveClass1}
            className="nav-link"
          >
            Users
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/admin?tab=visitors"
            isActive={navLinkActiveClass2}
            className="nav-link"
          >
            visitors
          </NavLink>
        </li>
      </ul>
      {/* Tabs  */}
      {isTabLoading && loadingSpinner}
      {!isTabLoading && queryParamTab === "users" && allUsersTab}
      {!isTabLoading && queryParamTab === "visitors" && allVisitorsTab}
    </div>
  );
};

export default AdminDashboard;
