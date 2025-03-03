import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
// import { useNavigate } from "react-router-dom";
const CreateMeetingForm = () => {
  const [formData, setFormData] = useState({
    mailServer: "",
    room: "",
    host: "",
    purpose: "",
    startDateTime: "",
    endDateTime: "",
    attendees: "",
    tenantId: "",
  });
console.log(formData);
  const [mailServers, setMailServers] = useState([]);
  // const [meetings, setMeetings] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  // const navigate = useNavigate();



  useEffect(() => {
    const fetchMailServers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/mailservers");
        setMailServers(response.data);
      } catch (error) {
        console.error("Error fetching mail servers:", error);
      }
    };

    // const fetchMeetings = async () => {
    //   try {
    //     if (!formData.host || !formData.startDateTime) {
    //       console.error("Host or startDateTime is missing.");
    //       return;
    //     }

    //     const response = await axios.get(`http://localhost:5000/meetings`, {
    //       params: {
    //         startDateTime: formData.startDateTime,
    //         endDateTime: formData.startDateTime,
    //         host: formData.host,
    //       },
    //     });

    //     console.log("fetchMeetings", response.data);
    //     setMeetings(response.data);
    //   } catch (error) {
    //     console.error("Error fetching meetings:", error);

    //   }
    // };

    fetchMailServers();
    // fetchMeetings();
  }, [formData.host, formData.startDateTime, formData.endDateTime]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const updatedData = {
    //   id: formData.id,
    //   startTime: new Date(formData.startDateTime).getTime(),
    //   endTime: new Date(formData.endDateTime).getTime(),
    //   purpose: formData.purpose,
    //   room: formData.room, 
    //   attendees: formData.attendees.split(",").map((email) => email.trim()),
    // };

    // try {
    //   const response = await fetch("http://localhost:5000/update-meeting", {
    //     method: editing ? "PUT" : "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(updatedData),
    //   });

    //   if (response.ok) {
    //     setPopupVisible(true);
    //     setTimeout(() => {
    //       setPopupVisible(false);
    //       window.location.href = "/create-meeting";
    //     }, 1000);
    //   } else {
    //     const error = await response.json();
    //     alert(`Failed to ${editing ? "update" : "create"} meeting: ${error.message}`);
    //   }
    // } catch (error) {
    //   console.error(`Error ${editing ? "updating" : "creating"} meeting:`, error);
    //   alert("An error occurred. Please try again.");
    // }

    try {
      const response = await axios.post(
        "http://localhost:5000/create-meeting", formData);
      console.log("Meeting created successfully:", response.data);
      setPopupVisible(true);
      setTimeout(() => {
        setPopupVisible(false);
        setEditing(false);
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Failed to create meeting.");
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleMailServer = (e) => {
    const selectedMailServer = JSON.parse(e.target.value);
    console.log(selectedMailServer);
    console.log(formData.tenantId);
    if (selectedMailServer) {
      console.log(selectedMailServer);
      setFormData({
        ...formData,
        mailServerId: selectedMailServer.id,
        tenantId: JSON.parse(selectedMailServer.credentials).tenantId,
      }
      );
    }
    console.log(formData);
  };
  // const convertEpochToHumanTime = (epochTime) => {
  //   if (!epochTime || isNaN(epochTime)) {
  //     console.error("Invalid epoch time:", epochTime);
  //     return ""; // Return an empty string for invalid values
  //   }

  //   const date = new Date(Number(epochTime) * (epochTime < 1e12 ? 1000 : 1));

  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const hours = String(date.getHours()).padStart(2, "0");
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  
  //   return `${year}-${month}-${day} ${hours}:${minutes}`;
  // };


  // const handleEditMeeting = (meeting) => {
  //   const normalizedAttendees =
  //   Array.isArray(meeting.visitor_emails) 
  //     ? meeting.visitor_emails.join(", ")
  //     : meeting.visitor_emails || "No Visitors"; 

  //   setEditing(true);
  //   setFormData({
  //     id: meeting.id,
  //     mailServer: meeting.mailServer || "",
  //     room: meeting.room_name|| "",
  //     host: meeting.e_mail || "",
  //     purpose: meeting.purpose || "",
  //     startDateTime: convertEpochToHumanTime(meeting.startTime).slice(0, 16),
  //     endDateTime: convertEpochToHumanTime(meeting.endTime).slice(0, 16),
  //     attendees: normalizedAttendees,
  //     tenantId: meeting.tenantId || "",
  //   });
  //   console.log("Converted Start Time:", convertEpochToHumanTime(meeting.startTime));
  //   console.log("Converted End Time:", convertEpochToHumanTime(meeting.endTime));
  //   console.log("Visitor email" ,meeting.visitor_emails)

  // };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const email = urlParams.get("email");
    const tenantId = urlParams.get("tenantId");

    if (id && email && tenantId) {
      fetchMeetingDetails(id, email,tenantId);
    }
  }, []);
  const formatDateTime = (dateString) => {
    if (!dateString) return ""; 
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const fetchMeetingDetails = async (id, email ,tenantId) => {
    try {
      const response = await fetch(`http://localhost:5000/get-meeting-details?id=${id}&host=${email}&tenantId=${tenantId}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          purpose: data.purpose || "",
          host:data.host || "",
          startDateTime: data.startDateTime || "",
          endDateTime: data.endDateTime || "",
          room: data.room || "",
          attendees: data.attendees || "",
        });
      } else {
        console.error("Failed to fetch meeting details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h1>Create Meeting</h1>
        <form className="meeting-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mailServer">Select Mail Server:</label>
            <select
              id="mailServer"
              name="mailServer"
              className="form-control"
              onChange={handleMailServer}
              value={formData.selectedMailServer}
              required
            >
              <option value="">Select the Mail-Server</option>
              {mailServers.map((server) => (
                <option key={server.id} value={JSON.stringify(server)}>
                  {server.domain}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="room">Room:</label>
            <input
              type="text"
              id="room"
              name="room"
              className="form-control"
              placeholder="Room Name"
              onChange={handleChange}
              value={formData.room}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="host">Host:</label>
            <input
              type="email"
              id="host"
              name="host"
              className="form-control"
              placeholder="Enter the Email"
              onChange={handleChange}
              value={formData.host}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose:</label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              className="form-control"
              placeholder="Purpose Of Meeting"
              onChange={handleChange}
              value={formData.purpose}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDateTime">Start Date & Time:</label>
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              className="form-control"
              onChange={handleChange}
              value={formatDateTime(formData.startDateTime)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDateTime">End Date & Time:</label>
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              className="form-control"
              onChange={handleChange}
              value={formatDateTime(formData.endDateTime)}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="attendees">Attendees:</label>
            <textarea
              id="attendees"
              name="attendees"
              className="form-control"
              placeholder="Add Attendees"
              onChange={handleChange}
              value={formData.attendees}
              required
            ></textarea>
          </div>

          <div className="form-group full-width">
            <button type="submit" className="submit-btn">
            Create Meeting
            </button>
          </div>
        </form>
        {popupVisible && (
          <div className="popup">
            <p>Meeting {editing ? "updated" : "created"} successfully!</p>
          </div>

        )}
      </div>
      {/* {formData.startDateTime && (
        <div className="meetings-container">
          <h2>Today's Meetings</h2>

          <div className="total-meetings-box">
            <p>Total Meetings: <span>{meetings.length}</span></p>
          </div>

          <ul className="meetings-list">
            {meetings.map((meeting) => (
              <li key={meeting.id} className="meeting-item">
                <div className="meeting-details">
                  <p>
                    <strong>Room:</strong> {meeting.room_name}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {meeting.purpose}
                  </p>
                  <p>
                    <strong>Time:</strong>{convertEpochToHumanTime(meeting.startTime)} - {convertEpochToHumanTime(meeting.endTime)}
                  </p>
                </div>
                <button className="edit-btn" onClick={() => handleEditMeeting(meeting)}>Edit</button>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};
export default CreateMeetingForm;
