import React from 'react';
import Navbar from './Navbar';

const AddAttendance = () => {
  return (
    <div className="add-attendance">
        <Navbar/>
      <h1>Add Attendance</h1>
      <form>
        <div>
          <label htmlFor="studentName">Student Name:</label>
          <input type="text" id="studentName" name="studentName" />
        </div>
        <div>
          <label htmlFor="attendanceDate">Date:</label>
          <input type="date" id="attendanceDate" name="attendanceDate" />
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select id="status" name="status">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default AddAttendance;
