import React from 'react';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  let navigate = useNavigate();

  function navigateToMain(){
    navigate('/home');
  }
    
  return (
        <div className="card container mt-5">
          <div className="card-body">
            <h5 className="card-title">Welcome to BlockChain JackPot</h5>
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">Parcel address</label>
                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"></input>
                <div id="emailHelp" className="form-text">Your ether accont will never be used by anyone else.</div>
              </div>
              <div className="mb-3">
                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                <input type="password" className="form-control" id="exampleInputPassword1"></input>
              </div>
              <button type="submit" className="btn btn-primary" onClick={navigateToMain}>Submit</button>
            </form>
          </div>
        </div>
      );
}

export default Login