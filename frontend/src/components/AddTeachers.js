import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const AddTeachers = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        branch: '',
        teacherID: '',
        role:''
    });
    const [teachers, setTeachers] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [branches, setBranches] = useState([]);

useEffect(() => {
    const fetchBranches = async () => {
        const response = await fetch('http://localhost:5000/branches');
        const data = await response.json();
        setBranches(data);
    };

    fetchBranches();
    console.log(branches);
},[]);


    // Function to fetch all teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            const response = await fetch('http://localhost:5000/teachers');
            const datax = await response.json();
            setTeachers(datax);
            console.log(datax);
        };
        
        fetchTeachers();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        if (e.target.name === 'phoneNumber') {
            // Validate phone number to be 10 digits
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 10) {
                setForm({
                    ...form,
                    [e.target.name]: value
                });
            }
        } else {
            setForm({
                ...form,
                [e.target.name]: e.target.value
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/teachers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const newTeacher = await response.json();
            if (response.ok) {
                window.location.reload();
                setForm({ name: '', email: '', password: '', phoneNumber: '', branch: '', teacherID: '', role:'' }); // Clear form
                alert('Teacher added successfully!');
            } else {
                throw new Error(newTeacher.error || 'Failed to add teacher');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // Handle row click
    const handleRowClick = (id) => {
        if (selectedRow === id) {
            setSelectedRow(null);
        } else {
            setSelectedRow(id);
        }
    };
    const role = sessionStorage.getItem('role');

    return (
  <div>
    <Navbar />
    <div className="flex flex-col items-center justify-center mt-4 md:mt-8 p-2">
      <div className="w-full md:w-2/4 bg-slate-300 p-4 md:p-6 rounded-3xl mx-2">
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-center">ADD USERs</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs"
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs"
            />
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-base"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch.name}>
                  {branch.branchCode}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="teacherID"
              placeholder="Teacher ID"
              value={form.teacherID}
              onChange={handleChange}
              className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs"
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-base"
            >
              <option value="">Select Role</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary mt-4 bg-[#2D5990] text-white">
            Add Users
          </button>
        </form>
      </div>

      <div className="w-full md:w-3/4 mt-4 md:mt-8 md:bg-white bg-slate-300 rounded-2xl md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Users List</h2>
        <div className="overflow-x-auto ">
          <table className="w-full table-auto bg-white border-collapse border border-gray-500 mx-2 mb-4 ">
            <thead className="bg-[#2D5990] text-white">
              <tr>
                <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base">Teacher ID</th>
                <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base">Name</th>
                <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base">Role</th>
                <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base">Email</th>
                <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base">Phone Number</th>
                <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base">Branch</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr
                  key={teacher._id}
                  className={`cursor-pointer ${
                    selectedRow === teacher._id ? 'bg-gray-700 text-white' : 'even:bg-gray-200 hover:bg-gray-400'
                  }`}
                  onClick={() => handleRowClick(teacher._id)}
                >
                  <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.teacherID}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.name}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.role}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.email}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.phoneNumber}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

};

export default AddTeachers;