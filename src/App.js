  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import "./App.css"
import moment from "moment-timezone";

  // import { useNavigate } from "react-router-dom";
  const CreateMeetingForm = () => {
    const [formData, setFormData] = useState({
      mailServer: "",
      selectedMailServer: "",
      room: "",
      host: "",
      purpose: "",
      startDateTime: "",
      endDateTime: "",
      attendees: "",
      tenantId: "",
      mailServerId: "",
    });
  console.log(formData);
    const [mailServers, setMailServers] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    
   
  
    // Convert UTC to IST for display
    const utcToIST = (utcDateTime) => {
      if (!utcDateTime) return "";
      
      let date;
      
      // Handle Unix timestamp in seconds
      if (typeof utcDateTime === 'number') {
        date = new Date(utcDateTime * 1000); // Convert to milliseconds
      } 
      // Handle ISO string
      else if (typeof utcDateTime === 'string') {
        // Check if it's already in ISO format
        if (utcDateTime.includes('T') || utcDateTime.includes('Z')) {
          date = new Date(utcDateTime);
        } else {
          // Assume it's a local datetime string
          date = new Date(utcDateTime + 'Z');
        }
      }
      // Handle Date object
      else if (utcDateTime instanceof Date) {
        date = utcDateTime;
      } else {
        console.error('Unsupported date format:', utcDateTime);
        return "";
      }
    
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', utcDateTime);
        return "";
      }
    
      // Convert to IST (UTC+5:30)
      const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const pad = num => num.toString().padStart(2, '0');
      return `${istTime.getFullYear()}-${pad(istTime.getMonth() + 1)}-${pad(istTime.getDate())}T${pad(istTime.getHours())}:${pad(istTime.getMinutes())}`;
    };

    useEffect(() => {
      const fetchMailServers = async () => {
        try {
          const apiUrl = `${process.env.REACT_APP_BASE_URL}/mailservers/`;
          console.log("Fetching mail servers from:", apiUrl);
          const response = await axios.get(apiUrl);
          console.log("THE URL :::: ",`${process.env.REACT_APP_BASE_URL}`);
          console.log('Full Response:', response);
          console.log('Response Data:', response.data);
          console.log('Response Data Type:', typeof response.data);
          
          // If the data is nested inside another object, access it correctly
          const mailServerData = response.data.data || response.data; // Try to access nested data if it exists
          
          if (Array.isArray(mailServerData)) {
            console.log('Mail Servers Found:', mailServerData);
            setMailServers(mailServerData);
          } else {
            console.error("Data structure received:", mailServerData);
            setMailServers([]);
          }
        } catch (error) {
          console.error("Error fetching mail servers:", error);
          setMailServers([]);
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

      // Validate required fields
      if (!formData.mailServerId || !formData.tenantId) {
        alert('Please select a mail server first');
        return;
      }

      if (!formData.room.trim()) {
        alert('Please enter a room name');
        return;
      }

      if (!formData.host.trim()) {
        alert('Please enter a host email');
        return;
      }

      if (!formData.purpose.trim()) {
        alert('Please enter a purpose');
        return;
      }

      if (!formData.startDateTime || !formData.endDateTime) {
        alert('Please select both start and end times');
        return;
      }

      if (!formData.attendees.trim()) {
        alert('Please enter at least one attendee');
        return;
      }

      try {
        // Format attendees as an array and validate email format
        const attendeesList = formData.attendees
          .split(',')
          .map(email => email.trim())
          .filter(email => {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!isValid) {
              console.warn(`Invalid email format: ${email}`);
            }
            return isValid && email.length > 0;
          });

        if (attendeesList.length === 0) {
          alert('Please enter at least one valid email address for attendees');
          return;
        }
debugger
        // Format dates to match server expectations
        const startDate  = moment(formData.startDateTime).valueOf();
        const endDate  = moment(formData.endDateTime).valueOf();
debugger
        // Validate dates
        // if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        //   alert('Invalid date format');
        //   return;
        // }

        if (startDate  >= endDate ) {
          alert('End time must be after start time');
          return;
        }

        // Create the meeting data object with the exact format the server expects
        const meetingData = {
          // mailserver_id: String(formData.mailServerId),
          tenantId:formData.tenantId,
          room: formData.room.trim(),
          host: formData.host.trim(),
          purpose: formData.purpose.trim(),
          startDateTime: Math.floor(new Date(startDate).getTime()), // Convert to Unix timestamp (seconds)
          endDateTime: Math.floor(new Date(endDate).getTime()),      // Convert to Unix timestamp (seconds)
          attendees: attendeesList
        };

        // Debug logs
        console.log('Form Data:', formData);
        console.log('Selected Mail Server:', formData.selectedMailServer);
        console.log('Sending Meeting Data:', JSON.stringify(meetingData, null, 2));

        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/mailservers/create-meeting`,
          meetingData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("Server Response:", response.data);
        setPopupVisible(true);
        setTimeout(() => {
          setPopupVisible(false);
          setEditing(false);
          window.location.reload();
        }, 3000);
      } catch (error) {
        // Enhanced error logging
        console.error("Error Details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          requestData: JSON.parse(error.config?.data || '{}'),
          requestHeaders: error.config?.headers
        });

        // Log the full error response
        if (error.response?.data) {
          console.error("Server Error Response:", JSON.stringify(error.response.data, null, 2));
        }

        // Show a more informative error message
        let errorMessage = 'Failed to create meeting:\n';
        if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage += error.response.data.error;
        } else if (error.response?.data?.validation_errors) {
          errorMessage += Object.entries(error.response.data.validation_errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
        } else {
          errorMessage += error.message;
        }
        alert(errorMessage);
      }
    };


    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleMailServer = (e) => {
      try {
        const selectedMailServer = JSON.parse(e.target.value);
        console.log('Selected Mail Server:', selectedMailServer);
        
        if (selectedMailServer) {
          const credentials = JSON.parse(selectedMailServer.credentials);
          console.log('Parsed credentials:', credentials);
          
          // Update form data with all necessary fields
          setFormData(prev => ({
            ...prev,
            mailServerId: String(selectedMailServer.id), // Ensure it's a string
            mailServer: selectedMailServer.domain,
            tenantId: String(credentials.tenantId), // Ensure it's a string
            selectedMailServer: e.target.value
          }));

          // Debug log
          console.log('Updated form data after mail server selection:', {
            mailServerId: String(selectedMailServer.id),
            tenantId: String(credentials.tenantId)
          });
        }
      } catch (error) {
        console.error('Error processing mail server selection:', error);
        alert('Error selecting mail server. Please try again.');
      }
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
      
    const fetchMeetingDetails = async (id, email ,tenantId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/mailservers/meeting-details?id=${id}&host=${email}&tenantId=${tenantId}`);
        const data = await response.json();

        if (response.ok) {
          setFormData({
            purpose: data.purpose || "",
            host:data.host || "",
            startDateTime: utcToIST(data.startDateTime),
            endDateTime: utcToIST(data.endDateTime),
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
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      const email = urlParams.get("email");
      const tenantId = urlParams.get("tenantId");

      if (id && email && tenantId) {
        fetchMeetingDetails(id, email,tenantId);
      }
    }, []);
  
    // const formatDateTime = (dateString) => {
    //   if (!dateString) return ""; 
    //   const date = new Date(dateString);
    //   return date.toISOString().slice(0, 16);
    // };


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
                {console.log('Current mailServers state:', mailServers)}
                {Array.isArray(mailServers) && mailServers.length > 0 ? (
                  mailServers.map((server) => {
                    console.log('Processing server:', server);
                    return (
                      <option key={server.id} value={JSON.stringify(server)}>
                        {server.domain || 'Unnamed Server'}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>
                    No mail servers available ({Array.isArray(mailServers) ? mailServers.length : 'not an array'})
                  </option>
                )}
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
                value={formData.startDateTime}
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
                value={formData.endDateTime}
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
