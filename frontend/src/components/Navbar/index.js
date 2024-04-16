import styled from 'styled-components';
import { Link } from 'react-router-dom'; // 确保已经导入了Link组件

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #F6E2D7;
  padding: 10px 50px;
`;

const Title = styled.h1`
  margin: 0; 
  font-size: 2rem; 
`;

const NavLinksContainer = styled.div`
  display: flex;
  // justify-content: flex-end;
`;

const NavLink = styled(Link)`
  color: #333;
  font-weight: bold;
  padding: 10px;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background-color: #ddd;
    border-radius: 4px;
  }
`;

const MyNavbar = () => {
  return (
    <Navbar>
      <Title>Jackpot</Title>
      <NavLinksContainer>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/game">Game</NavLink>
        <NavLink to="/account">Account</NavLink>
      </NavLinksContainer>
    </Navbar>
  );
};

export default MyNavbar;