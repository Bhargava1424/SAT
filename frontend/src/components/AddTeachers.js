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
        role: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [branches, setBranches] = useState([]);

    const role = sessionStorage.getItem('role');
    const userBranch = sessionStorage.getItem('branch');

    useEffect(() => {
        const fetchBranches = async () => {
            const response = await fetch('http://localhost:5000/branches');
            const data = await response.json();
            setBranches(data);
        };

        fetchBranches();
    }, []);

    useEffect(() => {
        const fetchTeachers = async () => {
            const response = await fetch('http://localhost:5000/teachers');
            const data = await response.json();
            
            if (role === 'director') {
                const filteredTeachers = data.filter(teacher => teacher.branch === userBranch);
                setTeachers(filteredTeachers);
            } else {
                setTeachers(data);
            }
        };

        fetchTeachers();
    }, [role, userBranch]);

    const handleChange = (e) => {
        if (e.target.name === 'phoneNumber') {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { ...form };

        if (role !== 'admin') {
            formData.branch = userBranch;
        }

        try {
            const response = await fetch('http://localhost:5000/teachers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const newTeacher = await response.json();
            if (response.ok) {
                window.location.reload();
                setForm({ name: '', email: '', password: '', phoneNumber: '', branch: '', teacherID: '', role: '' });
                alert('Teacher added successfully!');
            } else {
                throw new Error(newTeacher.error || 'Failed to add teacher');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRowClick = (id) => {
        if (selectedRow === id) {
            setSelectedRow(null);
        } else {
            setSelectedRow(id);
        }
    };

    const getAvailableRoles = () => {
        switch (role) {
            case 'admin':
                return ['admin', 'director', 'vice president', 'teacher', 'receptionist'];
            case 'director':
                return ['vice president', 'teacher', 'receptionist'];
            case 'vice president':
                return ['teacher', 'receptionist'];
            default:
                return [];
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-4 md:mt-8 p-2">
                <div className="w-full md:w-2/4 bg-gradient-to-br from-blue-100 to-blue-200 p-4 md:p-6 rounded-3xl shadow-lg mx-2">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-center text-[#2D5990]">ADD USER</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={form.name}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Role</option>
                                {getAvailableRoles().map((roleOption) => (
                                    <option key={roleOption} value={roleOption}>
                                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {role === 'admin' ? (
                                <select
                                    name="branch"
                                    value={form.branch}
                                    onChange={handleChange}
                                    className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map((branch) => (
                                        <option key={branch._id} value={branch.name}>
                                            {branch.branchCode}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="hidden"
                                    name="branch"
                                    value={userBranch}
                                />
                            )}
                            <input
                                type="text"
                                name="teacherID"
                                placeholder="User ID"
                                value={form.teacherID}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4 w-full md:w-auto bg-[#2D5990] hover:bg-[#00A0E3] text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
                            Add User
                        </button>
                    </form>
                </div>

                <div className="w-full md:w-3/4 mt-4 md:mt-8 bg-white rounded-3xl shadow-lg p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-center text-[#2D5990]">Users List</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto bg-white border-collapse border border-gray-500 mx-2 mb-4 rounded-lg shadow">
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
                                            selectedRow === teacher._id ? 'bg-[#00A0E3] text-white' : 'even:bg-gray-200 hover:bg-gray-400'
                                        } transition-all duration-300`}
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
