import english from '../assets/images/english .jpg';
import computer from '../assets/images/computer.jpeg';

const softwareList = [
  { id: 1, name: 'Software A', description: 'Powerful tool for X' },
  { id: 2, name: 'Software B', description: 'Designed for Y' },
  {
    id: 3,
    name: 'English Speaking Course',
    description: 'Fluency in English with real conversations',
    image: english,
    originalPrice: 1000,
    discountedPrice: 499,
    type: 'course',
  },
  {
    id: 4,
    name: 'Computer Basics Course',
    description: 'Learn essential computer skills',
    image: computer,
    originalPrice: 1200,
    discountedPrice: 499,
    type: 'course',
  },
];

export default softwareList;
