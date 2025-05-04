// Import the PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test function to update a course category
async function testCategoryUpdate() {
  try {
    console.log('Starting test...');
    
    // First, let's find an existing course
    const courses = await prisma.course.findMany({
      take: 1,
    });
    
    if (courses.length === 0) {
      console.log('No courses found to test with');
      return;
    }
    
    const course = courses[0];
    console.log('Found test course:', course.id, course.title);
    
    // Get all categories or create one if none exists
    let categories = await prisma.category.findMany({
      take: 1,
    });
    
    let category;
    
    if (categories.length === 0) {
      console.log('No categories found. Creating a test category...');
      category = await prisma.category.create({
        data: {
          name: 'Test Category ' + Date.now(),
        },
      });
      console.log('Created test category:', category.id, category.name);
    } else {
      category = categories[0];
      console.log('Found test category:', category.id, category.name);
    }
    
    // Now try to update the course with the category ID
    console.log('Attempting to update course with category ID...');
    console.log('Course ID:', course.id);
    console.log('Category ID:', category.id);
    
    const updatedCourse = await prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        categoryId: category.id,
      },
    });
    
    console.log('Successfully updated course with category:', updatedCourse);
  } catch (error) {
    console.error('Error testing category update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCategoryUpdate(); 