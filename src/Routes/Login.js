import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import { Redirect } from 'react-router';
import axios from 'axios';
import "./CSS/ExtraCss.css";
import Link from 'valuelink';
import {Input} from 'valuelink/tags';

let jwt = require('jsonwebtoken');

class Register extends Component {
    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
            errorMessage:'',
            items:[],
            redirect : false,
            redirectToStart : false,
            emailCheck: '',
            tokenData:'',
            userID:'',
            token:'',
            userNotExist: false,
            loginSuccess: false,
        };
    }

    componentDidMount() {
        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;

        if(retrievedObject === null){
            self.setState({ redirect : false });
        }else{
            axios({
                method: 'post',
                url: '/authentication/checkToken',
                headers:{
                    'Authorization': "Bearer " + tokenValue.token,
                }
            }).then(function (res) {
                if(res.data === "pass"){
                    self.setState({redirect: true});
                }else{
                    self.setState({ redirect : false });
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    //Send the input data to the server
    onSubmit = (e) =>{
        e.preventDefault();
        let self = this;
        let noUser = ()=>{
            self.setState({
                userNotExist: false,
            });
        };

        let loginSuccess = ()=>{
            //Change page when user logins in with correct data
            self.setState({redirect: true});
        };

        //Requests a user authentication token
        axios({
            method: 'post',
            url: '/authentication/checkLogin',
            data: {
                username: this.state.username,
                passwrd: this.state.password,
            }
        }).then(function (res) {
            //Displays error message, input not correct
            if(res.data === "fail"){
                self.setState({
                    userNotExist: true,
                });
                setTimeout(noUser, 2000);
                self.setState({ username: "" });
                self.setState({ password: "" });
            }
            else{
                if(res.data === null){
                    alert("Something went wrong!");
                }else{
                    //Saves the authentication token into the localstorage
                    let userdetails = jwt.decode(res.data.token);
                    localStorage.setItem('userToken', JSON.stringify(res.data));
                    //Gets the user data
                    axios({
                        method: 'post',
                        url: '/select/user',
                        data: {
                            userID: userdetails.user.id,
                        }
                    }).then(function (res) {
                        //Updates the location stored in the localstorage
                        localStorage.removeItem('location');
                        localStorage.setItem('location', res.data[0].city);

                        //Redirects to the homepage
                        self.setState({
                            loginSuccess: true,
                        });
                        setTimeout(loginSuccess, 2000);
                    });
                }
            }
        });
    };

    //Changes the password to plain text
    showPassword = (checkedId) =>{
        if(document.getElementById(checkedId).checked){
            document.getElementById('password').type = 'text';
        }else{
            document.getElementById('password').type = 'password';
        }
    };

    //Redirects to homepage
    back = () =>{
        this.setState({
            redirect:true
        });
    };

    //If user hasnt set a default location, this will set the back button to direct to start page
    backToStart = () =>{
        this.setState({
            redirectToStart:true
        });
    };

    render() {
        const username = Link.state(this, 'username')
            .check( x => x ,'Name is require');
        const password = Link.state(this, 'password')
            .check( x => x ,'Name is require');

        return (
            <div className="container">
                <div className="col-xs-12 col-sm-12 col-md-12">
                    <br/>
                    <form className="form-horizontal" id="transparentBack">
                        <fieldset>
                            <legend className="text-center">Login</legend>
                            <br/>
                            {this.state.userNotExist && (
                                <div className="row">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-8">
                                        <div className="alert alert-danger text-center">
                                            <strong>Wrong log in details, try again!</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {this.state.loginSuccess && (
                                <div className="row">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-8">
                                        <div className="alert alert-success text-center">
                                            <strong>Login Successful!<h3><span role="img" aria-label="success">&#x2705;</span></h3></strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!this.state.userNotExist && !this.state.loginSuccess && (
                                <div>
                                    <div className="form-group">
                                        <label htmlFor="inputUsername" className="col-md-4 control-label">Username</label>
                                        <div className="col-md-4">
                                            <Input className="form-control" label="test" valueLink={username} type="text" placeholder="Username"/>
                                        </div>
                                    </div>



                                    <div className="form-group">
                                        <label htmlFor="inputPassword" className="col-md-4 control-label">Password</label>
                                        <div className="col-md-4">
                                            <Input className="form-control" label="test" valueLink={password} type="password" placeholder="Password" id="password"/>
                                            <div className="checkbox">
                                                <label>
                                                    <input type="checkbox" id="checkbox" onClick={this.showPassword.bind(this,'checkbox')}/>
                                                    <p>Show Password</p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!this.state.loginSuccess && (
                                <div className="row">
                                    <div className="text-center">
                                        <div className="btn-group">
                                            <button type="submit" className="btn btn-success center-block" onClick={this.onSubmit} disabled={username.error || password.error}>Submit</button>
                                            {localStorage.getItem('location') && (
                                                <button className="btn btn-danger" onClick={this.back}>Go Back</button>
                                            )}
                                            {!localStorage.getItem('location') && (
                                                <button className="btn btn-danger" onClick={this.backToStart}>Go Back</button>
                                            )}
                                        </div>
                                        <br/><br/>
                                        {localStorage.getItem('location') && (
                                            <NavLink className="links" exact to="/Register">
                                                Don't have an account?
                                            </NavLink>
                                        )}
                                    </div>
                                </div>
                            )}

                        </fieldset>

                        <p className="text-danger">{this.state.errorMessage}</p>
                    </form>
                </div>

                {this.state.redirect && (
                    <Redirect push to="/Home"/>
                )}
                {this.state.redirectToStart && (
                    <Redirect push to="/"/>
                )}
            </div>
        );
    }
}

export default Register;