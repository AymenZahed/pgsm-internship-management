const db = require('../config/database');

// Update statuses of internships based on dates
const updateInternshipStatuses = async () => {
    try {
        console.log('Running scheduled internship status update...');

        // 1. Activate upcoming internships that have started
        const [activatedResult] = await db.query(
            `UPDATE internships 
       SET status = 'active' 
       WHERE status = 'upcoming' AND start_date <= CURDATE()`
        );

        if (activatedResult.affectedRows > 0) {
            console.log(`Activated ${activatedResult.affectedRows} internships`);
        }

        // 2. Complete active internships that have ended
        const [completedResult] = await db.query(
            `UPDATE internships 
       SET status = 'completed' 
       WHERE status = 'active' AND end_date < CURDATE()`
        );

        if (completedResult.affectedRows > 0) {
            console.log(`Completed ${completedResult.affectedRows} internships`);
        }

    } catch (error) {
        console.error('Error updating internship statuses:', error);
    }
};

// Start the scheduler
const startScheduler = () => {
    // Run immediately on startup
    updateInternshipStatuses();

    // Run every hour
    setInterval(updateInternshipStatuses, 60 * 60 * 1000);
};

module.exports = {
    startScheduler,
    updateInternshipStatuses
};
