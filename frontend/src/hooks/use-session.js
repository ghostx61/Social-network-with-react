import sendRequest from "../helper/sendRequest";

const useSession = () => {
  const createSession = async () => {
    const [data, error] = await sendRequest({
      method: "GET",
      url: "/session/create",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (error) {
      return;
    }
    // console.log("new session created. ID: " + data.sessionID);
    sessionStorage.setItem("visit", data.sessionID);
    return;
  };
  const updateSession = async (updateType, username) => {
    const sessionID = sessionStorage.getItem("visit");
    // console.log("sessionId " + sessionID);
    // console.log("username " + username);
    if (!sessionID) return;

    const body = { sessionID, updateType, username };
    const [data, error] = await sendRequest({
      method: "POST",
      url: "/session/update",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return;
  };
  return { createSession, updateSession };
};
export default useSession;
