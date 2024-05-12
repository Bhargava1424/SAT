import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const AddTeachers = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        branch: '',
        teacherID: ''
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
}, []);


    // Function to fetch all teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            const response = await fetch('http://localhost:5000/teachers');
            const data = await response.json();
            setTeachers(data);
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
                setTeachers([...teachers, newTeacher]);
                setForm({ name: '', email: '', password: '', phoneNumber: '', branch: '', teacherID: '' }); // Clear form
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

    return (
        <div>
            <Navbar/>
            <div className="flex flex-col items-center justify-center mt-8">
                <div className="w-2/4 bg-gray-200 p-6 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-4">Add Teachers</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="input input-bordered w-full bg-white my-2 rounded-xl rounded-3xl" />
                            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input input-bordered w-full bg-white my-2 rounded-xl" />
                            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="input input-bordered w-full bg-white my-2 rounded-xl" />
                            <input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="input input-bordered w-full bg-white my-2 rounded-xl" />
                            <select
                                name="branch"
                                value={form.branch}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black my-2 rounded-xl"
                            >
                                <option value="">Select Branch</option>
                                {branches.map((branch) => (
                                    <option key={branch._id} value={branch.name}>
                                        {branch.branchCode}
                                    </option>
                                ))}
                            </select>
                            <input type="text" name="teacherID" placeholder="Teacher ID" value={form.teacherID} onChange={handleChange} className="input input-bordered w-full bg-white my-2 rounded-xl" />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4 bg-[#2D5990] text-white">Add Teacher</button>
                    </form>
                </div>

                <div className="w-3/4 mt-8">
                    <h2 className="text-2xl font-bold mb-2">Teachers List</h2>
                    <table className="w-full table-auto bg-white border-collapse border border-gray-600 m-4">
                        <thead className="bg-[#2D5990] text-white">
                            <tr>
                                <th className="px-4 py-2 text-center border-b border-gray-600 border-r">Name</th>
                                <th className="px-4 py-2 text-center border-b border-gray-600 border-r">Email</th>
                                <th className="px-4 py-2 text-center border-b border-gray-600 border-r">Phone Number</th>
                                <th className="px-4 py-2 text-center border-b border-gray-600 border-r">Branch</th>
                                <th className="px-4 py-2 text-center border-b border-gray-600 border-r">Teacher ID</th>
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
                                    <td className="px-4 py-2 border-b border-gray-600 border-r">{teacher.name}</td>
                                    <td className="px-4 py-2 border-b border-gray-600 border-r">{teacher.email}</td>
                                    <td className="px-4 py-2 border-b border-gray-600 border-r">{teacher.phoneNumber}</td>
                                    <td className="px-4 py-2 border-b border-gray-600 border-r">{teacher.branch}</td>
                                    <td className="px-4 py-2 border-b border-gray-600 border-r">{teacher.teacherID}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AddTeachers;