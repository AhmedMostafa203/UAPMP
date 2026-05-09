/**
 * Admin Controller
 * Handles admin management operations: delete users, delete classes, view students
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const Class = require("../models/Class");
const Assignment = require("../models/Assignment");
const AttendanceSession = require("../models/AttendanceSession");
const ClassAnnouncement = require("../models/ClassAnnouncement");
const AnnouncementComment = require("../models/AnnouncementComment");
const Submission = require("../models/Submission");

/**
 * DELETE USER API
 * Route: DELETE /api/admin/users/:id
 * Protection: authenticateToken, authorizeRole('admin', 'super_admin')
 *
 * Deletes a user and handles cascade deletions based on role
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // 2. Fetch the user to be deleted
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Prevent deleting super_admin
    if (userToDelete.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super_admin users",
      });
    }

    // 4. Prevent deleting currently logged-in admin
    if (currentUserId.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // 5. Handle cascade deletions based on user role
    if (userToDelete.role === "student") {
      // Remove student from all enrolled classes
      await Class.updateMany({ students: id }, { $pull: { students: id } });

      console.log(`[deleteUser] Removed student ${id} from all classes`);
    } else if (userToDelete.role === "instructor") {
      // 5a. Get all classes created by this instructor
      const instructorClasses = await Class.find({ instructor: id });

      // 5b. Collect all class IDs for cascade deletion
      const classIds = instructorClasses.map((cls) => cls._id);

      if (classIds.length > 0) {
        // Delete all assignments for these classes
        await Assignment.deleteMany({ class: { $in: classIds } });

        // Delete all attendance sessions for these classes
        await AttendanceSession.deleteMany({ classId: { $in: classIds } });

        // Delete all class announcements for these classes
        const announcementIds = await ClassAnnouncement.find({
          classId: { $in: classIds },
        }).select("_id");

        const announcementIdList = announcementIds.map((ann) => ann._id);

        // Delete all comments related to these announcements
        if (announcementIdList.length > 0) {
          await AnnouncementComment.deleteMany({
            announcementId: { $in: announcementIdList },
          });
        }

        // Delete all class announcements
        await ClassAnnouncement.deleteMany({ classId: { $in: classIds } });

        // Get all submission IDs to delete files if needed
        const submissions = await Submission.find({
          assignment: {
            $in: await Assignment.find({ class: { $in: classIds } })
              .select("_id")
              .distinct("_id"),
          },
        });

        // Delete all submissions
        await Submission.deleteMany({
          assignment: {
            $in: classIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        });

        // Delete the classes themselves
        await Class.deleteMany({ _id: { $in: classIds } });

        console.log(
          `[deleteUser] Deleted ${classIds.length} classes and related records for instructor ${id}`,
        );
      }
    }

    // 6. Delete the user
    await User.findByIdAndDelete(id);

    console.log(
      `[deleteUser] Successfully deleted user ${id} (role: ${userToDelete.role})`,
    );

    // 7. Return success response
    res.json({
      success: true,
      message: `User deleted successfully. Role: ${userToDelete.role}`,
    });
  } catch (error) {
    console.error("[deleteUser] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting user",
    });
  }
};

/**
 * DELETE CLASS API
 * Route: DELETE /api/admin/classes/:id
 * Protection: authenticateToken, authorizeRole('admin', 'super_admin')
 *
 * Deletes a class and all related records (cascade deletion)
 */
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID format",
      });
    }

    // 2. Check if class exists
    const classToDelete = await Class.findById(id);
    if (!classToDelete) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // 3. Delete all assignments for this class
    const assignments = await Assignment.find({ class: id });
    const assignmentIds = assignments.map((a) => a._id);

    await Assignment.deleteMany({ class: id });

    // 4. Delete all submissions for these assignments
    if (assignmentIds.length > 0) {
      await Submission.deleteMany({
        assignment: { $in: assignmentIds },
      });
    }

    // 5. Delete all attendance sessions for this class
    await AttendanceSession.deleteMany({ classId: id });

    // 6. Delete all class announcements for this class
    const announcements = await ClassAnnouncement.find({ classId: id });
    const announcementIds = announcements.map((a) => a._id);

    if (announcementIds.length > 0) {
      // 6a. Delete all comments on these announcements
      await AnnouncementComment.deleteMany({
        announcementId: { $in: announcementIds },
      });
    }

    // 6b. Delete the announcements themselves
    await ClassAnnouncement.deleteMany({ classId: id });

    // 7. Delete the class
    await Class.findByIdAndDelete(id);

    console.log(
      `[deleteClass] Successfully deleted class ${id} and all related records`,
    );

    // 8. Return success response
    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("[deleteClass] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting class",
    });
  }
};

/**
 * GET CLASS STUDENTS API
 * Route: GET /api/admin/classes/:id/students
 * Protection: authenticateToken, authorizeRole('admin', 'super_admin')
 *
 * Fetches all students enrolled in a class with pagination and search support
 */
exports.getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, search = "", sort = "fullName" } = req.query;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID format",
      });
    }

    // 2. Check if class exists and populate instructor and students
    const classData = await Class.findById(id)
      .populate({
        path: "instructor",
        select: "_id fullName email university college", // Exclude sensitive fields
      })
      .populate({
        path: "students",
        select: "_id fullName email studentId university college", // Exclude password, tokens
      });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // 3. Filter students by search query (name or email)
    let filteredStudents = classData.students;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          (student.studentId &&
            student.studentId.toLowerCase().includes(searchLower)),
      );
    }

    // 4. Sorting
    const sortOptions = {
      fullName: (a, b) => a.fullName.localeCompare(b.fullName),
      email: (a, b) => a.email.localeCompare(b.email),
      studentId: (a, b) => (a.studentId || "").localeCompare(b.studentId || ""),
    };

    if (sortOptions[sort]) {
      filteredStudents.sort(sortOptions[sort]);
    }

    // 5. Pagination
    const pageSize = 20;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredStudents.length / pageSize);

    console.log(
      `[getClassStudents] Retrieved ${paginatedStudents.length} students for class ${id}`,
    );

    // 6. Return response with class info and students
    res.json({
      success: true,
      class: {
        _id: classData._id,
        name: classData.name,
        courseCode: classData.courseCode,
        semester: classData.semester,
        year: classData.year,
        section: classData.section,
        joinCode: classData.joinCode,
        isActive: classData.isActive,
      },
      instructor: classData.instructor
        ? {
            _id: classData.instructor._id,
            fullName: classData.instructor.fullName,
            email: classData.instructor.email,
            university: classData.instructor.university,
            college: classData.instructor.college,
          }
        : null,
      totalStudents: filteredStudents.length,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      students: paginatedStudents,
    });
  } catch (error) {
    console.error("[getClassStudents] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching class students",
    });
  }
};

/**
 * GET ALL CLASSES API (for admin dashboard)
 * Route: GET /api/admin/classes
 * Protection: authenticateToken, authorizeRole('admin', 'super_admin')
 *
 * Fetches all classes with pagination
 */
exports.getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { courseCode: { $regex: search, $options: "i" } },
            { section: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * pageSize;

    // Fetch classes
    const classes = await Class.find(searchFilter)
      .populate("instructor", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Count total documents
    const total = await Class.countDocuments(searchFilter);
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalPages,
        totalItems: total,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      classes: classes.map((cls) => ({
        _id: cls._id,
        name: cls.name,
        courseCode: cls.courseCode,
        semester: cls.semester,
        year: cls.year,
        section: cls.section,
        joinCode: cls.joinCode,
        instructor: cls.instructor,
        studentCount: cls.students.length,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
      })),
    });
  } catch (error) {
    console.error("[getAllClasses] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching classes",
    });
  }
};

/**
 * GET ALL USERS API (for admin dashboard)
 * Route: GET /api/admin/users
 * Protection: authenticateToken, authorizeRole('admin', 'super_admin')
 *
 * Fetches all users with pagination and filtering by role
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role = "", search = "" } = req.query;

    // Build filters
    const roleFilter = role ? { role } : {};
    const searchFilter = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { studentId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const filter = { ...roleFilter, ...searchFilter };

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * pageSize;

    // Fetch users (exclude passwords)
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Count total documents
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalPages,
        totalItems: total,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      users,
    });
  } catch (error) {
    console.error("[getAllUsers] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching users",
    });
  }
};
