const Employee = require('../models/Employee');

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all employees with pagination and filtering
exports.getAllEmployees = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      position,
      minSalary,
      maxSalary
    } = req.query;

    // Build search query
    const searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add position filter
    if (position) {
      searchQuery.position = position;
    }

    // Add salary range filter
    if (minSalary || maxSalary) {
      searchQuery.salary = {};
      if (minSalary) searchQuery.salary.$gte = parseFloat(minSalary);
      if (maxSalary) searchQuery.salary.$lte = parseFloat(maxSalary);
    }

    // Sorting
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch employees
    const employees = await Employee.find(searchQuery)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    // Total count
    const total = await Employee.countDocuments(searchQuery);

    res.json({
      employees,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    // First try to update the existing employee
    let employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // If employee not found, create a new one
    if (!employee) {
      employee = new Employee(req.body);
      await employee.save();
      return res.status(201).json({ 
        message: 'Employee created successfully', 
        employee 
      });
    }
    
    // Return updated employee
    res.json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message,
      ...(error.errors && { errors: { fields: error.errors } })
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getEmployeeStats = async (req, res) => {
  try {
  // Total Employees
  const totalEmployees = await Employee.countDocuments();
  

  const totalSalaryResult = await Employee.aggregate([
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$salary' } 
      } 
    }
  ]);
  
  // Department Stats with Error Handling
  const departmentStats = await Employee.aggregate([
    { 
      $group: { 
        _id: '$position', 
        count: { $sum: 1 },
        totalSalary: { $sum: '$salary' }
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id
        name: '$_id', // Rename _id to name
        count: 1,
        averageSalary: { 
          $cond: [
            { $gt: ['$count', 0] }, 
            { $divide: ['$totalSalary', '$count'] }, 
            0 
          ]
        }
      }
    },
    {
      $sort: { count: -1 } // Sort by count descending
    }
  ]);
  
  res.json({
    totalEmployees,
    totalSalary: totalSalaryResult[0]?.total || 0,
    departments: departmentStats
  });
  } catch (error) {
  console.error('Error in getEmployeeStats:', error);
  res.status(500).json({
  message: 'Error fetching employee statistics',
  error: error.message
  });
  }
  };