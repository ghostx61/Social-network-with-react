import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import sendRequest from "../../helper/sendRequest";

import { formatDate2 } from "../../helper/dataTransform";

const AdminDashboard = () => {
  const authData = useSelector((state) => state.auth);
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector((state) => state.auth.role === "admin");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
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
      console.log(data);
      setUsers([...data.data]);
    };
    getUsers();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
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
              <td>{formatDate2(user.createdAt)}</td>
            </tr>
          ))}
          {/* <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Larry the Bird</td>
            <td>@twitter</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
