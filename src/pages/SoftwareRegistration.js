import { useParams } from 'react-router-dom';

const SoftwareRegistration = () => {
  const { softwareId } = useParams();

  return (
    <div className="p-4">
      {softwareId === '1' && <div>Registration for Software 1</div>}
      {softwareId === '2' && <div>Registration for Software 2</div>}
      {/* Add more conditions as needed */}
    </div>
  );
};

export default SoftwareRegistration;
