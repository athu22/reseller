import { useParams } from 'react-router-dom';
import UserForm from '../components/UserForm';

const CreateUser = () => {
  const { softwareId } = useParams();

  return <UserForm softwareId={softwareId} />;
};

export default CreateUser;
