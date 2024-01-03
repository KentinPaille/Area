import { useState, useEffect } from 'react';

// Components
import HomeHeader from '../components/home/HomeHeader';
import ActionsContainer from '../components/home/actionsContainer/ActionsContainer';
import ServicesContainer from '../components/home/servicesContainer/ServicesContainer';
import LoginContainer from '../components/home/loginContainer/LoginContainer';

// Interfaces
import { ProtectedPage } from '../interfaces/protectedPage';
import Background from '../components/wrappers/Background';
import { User } from '../interfaces/user';
import { ServicesProps } from '../interfaces/services';

// Methods
import fetchAboutJson from '../methods/fetchAboutJson';
import sendGitHubCode from '../methods/sendGitHubCode';

export function getStaticProps(): ProtectedPage {
  return {
    props: {
      isProtected: true
    }
  }
}

const getCodeFromURL = (userId: string) => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (code && !localStorage.getItem('githubTokenSent')) {
    localStorage.setItem('githubTokenSent', 'true');
    localStorage.setItem('gitHubToken', code);
    sendGitHubCode(code, userId);
  }
}

const HomePage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') as string) as User;

  const code = localStorage.getItem('gitHubToken');
  const gitHubStatus = code ? true : false;

  const [services, setServices] = useState<ServicesProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedServices = await fetchAboutJson();

      if (!gitHubStatus) {
        setServices(fetchedServices.filter((service: ServicesProps) => service.name !== 'Github'));
      } else {
        setServices(fetchedServices);
      }
    }

    fetchData();
  }, [gitHubStatus]);


  useEffect(() => {
    if (user) {
      getCodeFromURL(user.sub);
    }
  }, [user])

  return (
    <Background className="flex flex-col p-5 space-y-5">
      <HomeHeader user={user}/>
      <ActionsContainer services={services} user={user}/>
      <LoginContainer gitHubStatus={gitHubStatus}/>
      <ServicesContainer services={services} />
    </Background>
  );
};

export default HomePage;
