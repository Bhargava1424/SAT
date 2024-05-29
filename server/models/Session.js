const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherID: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    clusterID: {
        type: String,
        required: true
    }
});

const sessionSchema = new mongoose.Schema({
    period: {
        type: String,
        required: true
    },
    teachers: {
        type: [teacherSchema],
        required: true
    }
});

module.exports = mongoose.model('Session', sessionSchema);




// [
//     {
//         "period": "Mar 25, 2024 - Apr 7, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "complete", "clusterID": "001"},
//             {"teacherID": "004", "status": "complete", "clusterID": "002"},
//             {"teacherID": "005", "status": "complete", "clusterID": "003"},
//             {"teacherID": "006", "status": "complete", "clusterID": "004"},
//             {"teacherID": "007", "status": "complete", "clusterID": "005"}
//         ]
//     },
//     {
//         "period": "Apr 8, 2024 - Apr 21, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "complete", "clusterID": "002"},
//             {"teacherID": "004", "status": "complete", "clusterID": "003"},
//             {"teacherID": "005", "status": "complete", "clusterID": "004"},
//             {"teacherID": "006", "status": "complete", "clusterID": "005"},
//             {"teacherID": "007", "status": "complete", "clusterID": "001"}
//         ]
//     },
//     {
//         "period": "Apr 22, 2024 - May 5, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "complete", "clusterID": "003"},
//             {"teacherID": "004", "status": "complete", "clusterID": "004"},
//             {"teacherID": "005", "status": "complete", "clusterID": "005"},
//             {"teacherID": "006", "status": "complete", "clusterID": "001"},
//             {"teacherID": "007", "status": "complete", "clusterID": "002"}
//         ]
//     },
//     {
//         "period": "May 6, 2024 - May 19, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "complete", "clusterID": "004"},
//             {"teacherID": "004", "status": "incomplete", "clusterID": "005"},
//             {"teacherID": "005", "status": "complete", "clusterID": "001"},
//             {"teacherID": "006", "status": "complete", "clusterID": "002"},
//             {"teacherID": "007", "status": "incomplete", "clusterID": "003"}
//         ]
//     },
//     {
//         "period": "May 20, 2024 - Jun 2, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "incomplete", "clusterID": "005"},
//             {"teacherID": "004", "status": "incomplete", "clusterID": "001"},
//             {"teacherID": "005", "status": "complete", "clusterID": "002"},
//             {"teacherID": "006", "status": "incomplete", "clusterID": "003"},
//             {"teacherID": "007", "status": "complete", "clusterID": "004"}
//         ]
//     },
//     {
//         "period": "Jun 3, 2024 - Jun 16, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "upcoming", "clusterID": "001"},
//             {"teacherID": "004", "status": "upcoming", "clusterID": "002"},
//             {"teacherID": "005", "status": "upcoming", "clusterID": "003"},
//             {"teacherID": "006", "status": "upcoming", "clusterID": "004"},
//             {"teacherID": "007", "status": "upcoming", "clusterID": "005"}
//         ]
//     },
//     {
//         "period": "Jun 17, 2024 - Jun 30, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "upcoming", "clusterID": "002"},
//             {"teacherID": "004", "status": "upcoming", "clusterID": "003"},
//             {"teacherID": "005", "status": "upcoming", "clusterID": "004"},
//             {"teacherID": "006", "status": "upcoming", "clusterID": "005"},
//             {"teacherID": "007", "status": "upcoming", "clusterID": "001"}
//         ]
//     },
//     {
//         "period": "Jul 1, 2024 - Jul 14, 2024",
//         "teachers": [
//             {"teacherID": "003", "status": "upcoming", "clusterID": "003"},
//             {"teacherID": "004", "status": "upcoming", "clusterID": "004"},
//             {"teacherID": "005", "status": "upcoming", "clusterID": "005"},
//             {"teacherID": "006", "status": "upcoming", "clusterID": "001"},
//             {"teacherID": "007", "status": "upcoming", "clusterID": "002"}
//         ]
//     }
// ]
