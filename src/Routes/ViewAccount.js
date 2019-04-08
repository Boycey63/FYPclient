import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import Link from "valuelink/lib/index";
import axios from "axios/index";
import {Input, Select} from 'valuelink/tags';

const apikey= 'AIzaSyAhQQ5ukQIZzmASW32z4ziFINfwb8Zhu5U';
let jwt = require('jsonwebtoken');

class ViewAccount extends Component {
    constructor() {
        super();
        this.state = {
            signedIn: false,
            userDetails: [],
            redirectToBusiness: false,
            redirectOnLogout: false,
            redirectOnInitialPage: false,
            location: '',
            latitude: '',
            longitude: '',
            update: false,
            username: '',
            email: '',
            password: '',
            repassword: '',
            phonenum: '',
            city: '',
            gender: '',
            DOB: '',
            userType: 0,
            username2: '',
            email2: '',
            password2: '',
            repassword2: '',
            phonenum2: '',
            city2: '',
            gender2: '',
            DOB2: '',
            userType2: 0,
            updateSuccess: false,
            delete: false,
            deleted: false,
            searchTerm: '',
            redirectSearchTerm: false,
        };
    }

    componentDidMount(){
        if(!localStorage.getItem('location')) {
            this.setState({
                redirectOnInitialPage: true,
            });
        }else{
            this.setState({
                userLocation: localStorage.getItem('location'),
            });
        }

        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;

        if(retrievedObject === null){
            self.setState({ redirectOnInitialPage: true });
        }else{
            axios({
                method: 'post',
                url: '/authentication/checkToken',
                headers:{
                    'Authorization': "Bearer " + tokenValue.token,
                }
            }).then(function (res) {
                if(res.data === "pass"){
                    self.setState({userDetails: jwt.decode(tokenValue.token)});
                    self.setState({ signedIn: true });
                    if(self.state.userDetails.user.userType === 1){
                        self.setState({
                            userType: 1,
                        });
                    }
                    if(self.state.userDetails.user.userType === 2){
                        self.setState({
                            userType: 2,
                        });
                    }
                    if(self.state.userDetails.user.userType === 3){
                        self.setState({
                            userType: 3,
                        });
                    }
                    axios({
                        method: 'post',
                        url: '/select/user',
                        data: {
                            userID: self.state.userDetails.user.id,
                        }
                    }).then(function (res) {
                        self.setState({
                            username: res.data[0].username,
                            email: res.data[0].email,
                            phonenum: res.data[0].phoneNum,
                            city: res.data[0].city,
                            gender: res.data[0].gender,
                            DOB: res.data[0].DateofBirth2,
                            userType: res.data[0].userType,
                            username2: res.data[0].username,
                            email2: res.data[0].email,
                            password2: res.data[0].passwrd,
                            repassword2: res.data[0].repassword,
                            phonenum2: res.data[0].phoneNum,
                            city2: res.data[0].city,
                            gender2: res.data[0].gender,
                            DOB2: res.data[0].DateofBirth,
                            userType2: res.data[0].userType,
                        });
                    });
                }else{
                    self.setState({ redirectOnInitialPage: true });
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    //Update user details
    onSubmit = () =>{
        let self = this;

        let updateSuccess = () =>{
            this.setState({
                updateSuccess:false,
                update:false,
            });
        };

        axios({
            method: 'post',
            url: '/update/UserDetail',
            data: {
                username: self.state.username,
                email: self.state.email,
                phoneNum: self.state.phonenum,
                passwrd: self.state.password,
                city: self.state.city,
                gender: self.state.gender,
                DOB: self.state.DOB,
                userType: self.state.userType,
                userID: self.state.userDetails.user.id,
            }
        }).then(function (res) {
            if(res.data === "success"){
                self.setState({
                    updateSuccess:true
                });
                setTimeout(updateSuccess, 2000);
                axios({
                    method: 'post',
                    url: '/select/user',
                    data: {
                        userID: self.state.userDetails.user.id,
                    }
                }).then(function (res) {
                    self.setState({
                        username: res.data[0].username,
                        email: res.data[0].email,
                        phonenum: res.data[0].phoneNum,
                        city: res.data[0].city,
                        gender: res.data[0].gender,
                        DOB: res.data[0].DateofBirth2,
                        userType: res.data[0].userType,
                        username2: res.data[0].username,
                        email2: res.data[0].email,
                        password2: res.data[0].passwrd,
                        repassword2: res.data[0].repassword,
                        phonenum2: res.data[0].phoneNum,
                        city2: res.data[0].city,
                        gender2: res.data[0].gender,
                        DOB2: res.data[0].DateofBirth,
                        userType2: res.data[0].userType,
                        password: '',
                        repassword: '',
                    });
                });
            }else{
                alert('error');
            }
        }).then(function (res) {
            //Check if user is logged in so that they get a new user authentication token
            axios({
                method: 'post',
                url: '/authentication/checkLogin',
                data: {
                    username: self.state.username,
                    passwrd: self.state.password,
                }
            }).then(function (res) {
                if(res.data === "fail"){
                    self.setState({
                        userNotExist: true,
                    });
                    self.setState({ username: "" });
                    self.setState({ password: "" });
                }
                else{
                    if(res.data === null){
                        alert("Something went wrong!");
                    }else{
                        let userdetails = jwt.decode(res.data.token);
                        self.setState({userDetails: userdetails});
                        localStorage.removeItem('userToken');
                        localStorage.setItem('userToken', JSON.stringify(res.data));
                        axios({
                            method: 'post',
                            url: '/select/user',
                            data: {
                                userID: userdetails.user.id,
                            }
                        }).then(function (res) {
                            localStorage.removeItem('location');
                            localStorage.setItem('location', res.data[0].city);
                        });
                    }
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
    };

    delete = () =>{
        this.setState({
            delete: true,
        })
    };

    //Delete user account
    deleteAccount = () =>{
        let self = this;

        let deleteSuccess = () =>{
            this.setState({
                redirectOnLogout: true,
            });
        };

        axios({
            method: 'post',
            url: '/delete/account',
            data: {
                userID: self.state.userDetails.user.id,
            }
        }).then(function (res) {
            if(res.data === "success"){
                localStorage.clear();
                self.setState({
                    deleted: true,
                });
                //Redirect to the homepage, sign out of user account
                setTimeout(deleteSuccess, 3000);
            }
        });
    };

    updateDetails = () =>{
        this.setState({
            update: true,
        })
    };

    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
            redirectSearchTerm: true,
        });
    };

    noChange = () =>{
        this.setState({
            update: false,
            delete: false,
        })
    };

    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        const username = Link.state(this, 'username')
            .check( x => x ,'Required field')
            .check( x => x.indexOf(' ') < 0,"Username shouldn't contain spaces")
            .check( x => x.match('[0-9]'), "Username must have at least one number")
            .check( x => x.match('[A-Z]'), "Username must have at least one capital letter")
            .check( x => x.length >= 4, 'Username must have more than 4 characters');
        const email = Link.state(this, 'email')
            .check( x => x ,'Required field')
            .check( x => x.indexOf(' ') < 0,"Email shouldn't contain spaces")
            .check( x => x.match('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), 'Must be a valid email, no capital letters e.g. example@gmail.com');
        const password = Link.state(this, 'password')
            .check( x => x ,'Required field')
            .check( x => x.indexOf(' ') < 0,"Password shouldn't contain spaces")
            .check( x => x.match('[a-zA-Z0-9]'), 'Input must be in the alphabet or numbers')
            .check( x => x.length >= 8, 'Password must have more than 7 characters')
            .check( x => x.match('[0-9]'), "Password must have at least one number")
            .check( x => x.match('[A-Z]'), "Password must have at least one capital letter");
        const repassword = Link.state(this, 'repassword')
            .check( x => x ,'Required field')
            .check( x => x === this.state.password ,'Passwords must match');
        const phonenum = Link.state(this, 'phonenum')
            .check( x => x ,'Required field')
            .check( x => !isNaN(x) ,'Phone Number must be only numbers')
            .check( x => x.length === 10 ,'Phone Number must be 10 digits long');
        const city = Link.state(this, 'city')
            .check( x => x ,'Required field');
        const gender = Link.state(this, 'gender')
            .check( x => x, 'Required field');
        const userType = Link.state(this, 'userType')
            .check( x => x, 'Required field');
        const DOB = Link.state(this, 'DOB')
            .check( x => x, 'Required field');
        const searchTerm =Link.state(this, 'searchTerm').check( x => x );

        return (
            <div>
                <div className="overallPage">
                    <nav className="navbar navbar-inverse">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-2" aria-expanded="true">
                                    <span className="sr-only">Toggle navigation</span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                                <NavLink exact to="/" className="navbar-brand ">The Little Guys</NavLink>
                            </div>

                            <div className="navbar-collapse collapse" id="bs-example-navbar-collapse-2" aria-expanded="true">

                                <ul className="nav navbar-nav">
                                    <li><NavLink exact to="/Home">Home</NavLink> <span className="sr-only">(current)</span></li>
                                    <li><NavLink exact to="/RecentReviews">Recent Reviews</NavLink></li>
                                    <li><NavLink exact to="/AllBusinesses">All Businesses</NavLink></li>
                                    <li><NavLink exact to="/SearchArea">Search Area</NavLink></li>
                                </ul>

                                <form class="navbar-form navbar-left" role="search">
                                    <div className="input-group">
                                        <Input type="text" className="form-control" placeholder="Search" valueLink={searchTerm}/>
                                        {searchTerm.error &&(
                                            <span className="input-group-btn"><button disabled={searchTerm.error} class="btn btn-default">Submit</button></span>
                                        )}
                                        {!searchTerm.error &&(
                                            <span className="input-group-btn"><button onClick={this.searchForBusiness} class="btn btn-success">Submit</button></span>
                                        )}
                                    </div>
                                </form>

                                {this.state.signedIn && (
                                    <ul className="nav navbar-nav navbar-right" id="checkLogin">
                                        <li className="dropdown">
                                            <a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{this.state.userDetails.user.username}<span className="caret"></span></a>
                                            <ul className="dropdown-menu" role="menu">
                                                {this.state.userType === 1 &&
                                                <li>
                                                    <NavLink activeClassName ="active" exact to="/WriteReview">Write a Review</NavLink>
                                                    <NavLink activeClassName ="active" exact to="/MyReviews">My Reviews</NavLink>
                                                </li>
                                                }
                                                {this.state.userType === 2 &&
                                                <li>
                                                    <NavLink activeClassName="active" exact to="/NewBusiness">Create New Business</NavLink>
                                                    <NavLink activeClassName="active" exact to="/MyBusiness">My Business</NavLink>
                                                </li>
                                                }

                                                {this.state.userType === 3 &&
                                                <li>
                                                    <NavLink activeClassName ="active" exact to="/WriteReview">Write a Review</NavLink>
                                                    <NavLink activeClassName="active" exact to="/NewBusiness">Create New Business</NavLink>
                                                    <NavLink activeClassName ="active" exact to="/MyReviews">My Reviews</NavLink>
                                                    <NavLink activeClassName="active" exact to="/MyBusiness">My Business</NavLink>
                                                    <NavLink activeClassName="active" exact to="/AdminReviewPage">Admin Page</NavLink>
                                                </li>
                                                }
                                                <li>
                                                    <NavLink activeClassName ="active" exact to="/ViewAccount">View Account</NavLink>
                                                </li>
                                            </ul>
                                        </li>
                                        <li><NavLink exact to="/Login" onClick={this.Logout}>Logout</NavLink></li>
                                    </ul>
                                )}
                                {!this.state.signedIn && (
                                    <ul className="nav navbar-nav navbar-right" id="checkLogin">
                                        <li><NavLink exact to="/Login">Login</NavLink></li>
                                        <li><NavLink exact to="/Register">Create Account</NavLink></li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </nav>

                    <div className="container-fluid">
                        <div className="col-xs-12 col-sm-12 col-md-12">
                            <div className="row">
                                <h3 className="text-center">My Account</h3>
                                {!this.state.update && !this.state.delete && !this.state.deleted &&(
                                    <div className="row">
                                        <br/>
                                        <div className="col-md-4"></div>
                                        <div className="col-md-4">
                                            <div className="panel panel-primary">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title text-center">{this.state.username2}</h3>
                                                </div>
                                                    <div className="panel-body text-center">
                                                        <div className="table-responsive">
                                                            <table className="table table-striped" id="showBorder">
                                                                <tbody>
                                                                    <tr>
                                                                        <td>Email</td>
                                                                        <td>{this.state.email2}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Gender</td>
                                                                        <td>{this.state.gender2}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>City</td>
                                                                        <td>{this.state.city2}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Phone number</td>
                                                                        <td>{this.state.phonenum2}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Date of Birth</td>
                                                                        <td>{this.state.DOB2}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>User type</td>
                                                                        {this.state.userType2 === 1 &&(
                                                                            <td>
                                                                                General Customer
                                                                            </td>
                                                                        )}
                                                                        {this.state.userType2 === 2 &&(
                                                                            <td>
                                                                                Business Owner
                                                                            </td>
                                                                        )}
                                                                        {this.state.userType2 === 3 &&(
                                                                            <td>
                                                                                Admin
                                                                            </td>
                                                                        )}
                                                                    </tr>
                                                                </tbody>
                                                            </table>

                                                            <div className="text-center">
                                                                <div className="btn-group">
                                                                    <button className="btn btn-success" onClick={this.updateDetails}>Update</button>
                                                                    <button className="btn btn-danger" onClick={this.delete}>Delete</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {this.state.delete && !this.state.deleted &&(
                                        <div>
                                            <br/>
                                            <div className="col-md-4"></div>
                                            <div className="col-md-4">
                                                <div className="panel panel-primary">
                                                    <div className="panel-heading">
                                                        <h3 className="panel-title text-center">{this.state.username2}</h3>
                                                    </div>
                                                    <div className="panel-body text-center">

                                                        <div className="alert alert-danger text-center">
                                                            <strong>Are you sure you want to delete your account!<h3><span role="img" aria-label="success">&#x270B;</span></h3></strong>
                                                            <button className="btn btn-warning" onClick={this.deleteAccount}>Delete</button>
                                                        </div>

                                                        <button className="btn btn-primary text-center" onClick={this.noChange}>Go Back</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {this.state.deleted &&(
                                        <div>
                                            <br/>
                                            <div className="col-md-4"></div>
                                            <div className="col-md-4">
                                                <div className="panel panel-primary">
                                                    <div className="panel-heading">
                                                        <h3 className="panel-title text-center">Bye Bye</h3>
                                                    </div>
                                                    <div className="panel-body text-center">
                                                        <div className="alert alert-danger text-center">
                                                            <strong>Your account has been deleted,<br/> Sorry to see you leave<h3>&#x2639;</h3></strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {this.state.update &&(
                                        <div className="row">
                                            <div className="col-md-2"></div>
                                            <div className="col-md-8">
                                                <div className="panel panel-primary">
                                                    <div className="panel-heading">
                                                        <h3 className="panel-title text-center">Update account</h3>
                                                    </div>
                                                    <div className="panel-body">
                                                    {!this.state.updateSuccess && (
                                                        <div>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputUsername" className="control-label">UserName</label>
                                                                    <Input className="form-control" id="username" valueLink={username} type="text" placeholder="UserName"/>
                                                                    <small className="text-danger">{username.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputEmail" className="control-label">Email</label>
                                                                    <Input className="form-control" id="email" valueLink={email} type="text" onBlur={this.checkEmail}  placeholder="Email"/>
                                                                    <small className="text-danger">{email.error}</small>
                                                                </div>
                                                            </div>

                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputPassword" className="control-label">Password</label>
                                                                    <Input className="form-control" label="test" valueLink={password} type="password" placeholder="Password"/>
                                                                    <small className="text-danger">{password.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="reinputPassword" className="control-label">Re-Enter Password</label>
                                                                    <Input className="form-control" label="test" valueLink={repassword} type="password" placeholder="Re-enter Password"/>
                                                                    <small className="text-danger">{repassword.error}</small>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputNumber" className="control-label=">Phone Number</label>
                                                                    <Input className="form-control" label="test" valueLink={phonenum} type="tel" onBlur={this.checkNumber}  placeholder="Phone Number"/>
                                                                    <small className="text-danger">{phonenum.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="inputCity" className="control-label">Country (Saves countries capital)</label>
                                                                    <Select className="form-control" valueLink={city}>
                                                                        <option value="" selected hidden>Select Method</option>
                                                                        <option value="Kabul" title="Afghanistan">Afghanistan</option>
                                                                        <option value="Mariehamn" title="Åland Islands">Åland Islands</option>
                                                                        <option value="Tirana" title="Albania">Albania</option>
                                                                        <option value="Algiers" title="Algeria">Algeria</option>
                                                                        <option value="Pago Pago" title="American Samoa">American Samoa</option>
                                                                        <option value="Andorra la Vella" title="Andorra">Andorra</option>
                                                                        <option value="Luanda" title="Angola">Angola</option>
                                                                        <option value="The Valley, Anguilla" title="Anguilla">Anguilla</option>
                                                                        <option value="Saint John's" title="Antigua and Barbuda">Antigua and Barbuda</option>
                                                                        <option value="Buenos Aires" title="Argentina">Argentina</option>
                                                                        <option value="Yerevan" title="Armenia">Armenia</option>
                                                                        <option value="Oranjestad" title="Aruba">Aruba</option>
                                                                        <option value="Canberra" title="Australia">Australia</option>
                                                                        <option value="Vienna" title="Austria">Austria</option>
                                                                        <option value="Baku" title="Azerbaijan">Azerbaijan</option>
                                                                        <option value="Nassau" title="Bahamas">Bahamas</option>
                                                                        <option value="Manama" title="Bahrain">Bahrain</option>
                                                                        <option value="Dhaka" title="Bangladesh">Bangladesh</option>
                                                                        <option value="Bridgetown" title="Barbados">Barbados</option>
                                                                        <option value="Minsk" title="Belarus">Belarus</option>
                                                                        <option value="Brussels" title="Belgium">Belgium</option>
                                                                        <option value="Belmopan" title="Belize">Belize</option>
                                                                        <option value="Porto-Novo" title="Benin">Benin</option>
                                                                        <option value="Hamilton, Bermuda" title="Bermuda">Bermuda</option>
                                                                        <option value="Thimphu" title="Bhutan">Bhutan</option>
                                                                        <option value="La Paz" title="Bolivia, Plurinational State of">Bolivia, Plurinational State of</option>
                                                                        <option value="Kralendijk" title="Bonaire, Sint Eustatius and Saba">Bonaire, Sint Eustatius and Saba</option>
                                                                        <option value="Sarajevo" title="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                                                        <option value="Gaborone" title="Botswana">Botswana</option>
                                                                        <option value="Brasilia" title="Brazil">Brazil</option>
                                                                        <option value="Bandar Seri Begawan" title="Brunei Darussalam">Brunei Darussalam</option>
                                                                        <option value="Sofia" title="Bulgaria">Bulgaria</option>
                                                                        <option value="Ouagadougou" title="Burkina Faso">Burkina Faso</option>
                                                                        <option value="Bujumbura" title="Burundi">Burundi</option>
                                                                        <option value="Phnom Penh" title="Cambodia">Cambodia</option>
                                                                        <option value="Yaounde" title="Cameroon">Cameroon</option>
                                                                        <option value="Ottawa" title="Canada">Canada</option>
                                                                        <option value="Praia" title="Cape Verde">Cape Verde</option>
                                                                        <option value="George Town,Cayman Islands" title="Cayman Islands">Cayman Islands</option>
                                                                        <option value="Bangui" title="Central African Republic">Central African Republic</option>
                                                                        <option value="N'Djamena" title="Chad">Chad</option>
                                                                        <option value="Santiago" title="Chile">Chile</option>
                                                                        <option value="Beijing" title="China">China</option>
                                                                        <option value="Flying Fish Cove‎" title="Christmas Island">Christmas Island</option>
                                                                        <option value="West Island, Cocos (Keeling) Islands" title="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option>
                                                                        <option value="Bogota" title="Colombia">Colombia</option>
                                                                        <option value="Moroni" title="Comoros">Comoros</option>
                                                                        <option value="Brazzaville" title="Congo">Congo</option>
                                                                        <option value="Kinshasa, the Democratic Republic of the" title="Congo, the Democratic Republic of the">Congo, the Democratic Republic of the</option>
                                                                        <option value="Avarua" title="Cook Islands">Cook Islands</option>
                                                                        <option value="San Jose" title="Costa Rica">Costa Rica</option>
                                                                        <option value="Yamoussoukro " title="Côte d'Ivoire">Côte d'Ivoire</option>
                                                                        <option value="Zagreb" title="Croatia">Croatia</option>
                                                                        <option value="Havana" title="Cuba">Cuba</option>
                                                                        <option value="Willemstad" title="Curaçao">Curaçao</option>
                                                                        <option value="Nicosia" title="Cyprus">Cyprus</option>
                                                                        <option value="Prague" title="Czech Republic">Czech Republic</option>
                                                                        <option value="Copenhagen" title="Denmark">Denmark</option>
                                                                        <option value="Djibouti" title="Djibouti">Djibouti</option>
                                                                        <option value="Roseau" title="Dominica">Dominica</option>
                                                                        <option value="Santo Domingo" title="Dominican Republic">Dominican Republic</option>
                                                                        <option value="Dili" title="East Timor">East Timor</option>
                                                                        <option value="Quito" title="Ecuador">Ecuador</option>
                                                                        <option value="Cairo" title="Egypt">Egypt</option>
                                                                        <option value="San Salvador" title="El Salvador">El Salvador</option>
                                                                        <option value="Malabo" title="Equatorial Guinea">Equatorial Guinea</option>
                                                                        <option value="Asmara" title="Eritrea">Eritrea</option>
                                                                        <option value="Tallinn" title="Estonia">Estonia</option>
                                                                        <option value="Addis Ababa" title="Ethiopia">Ethiopia</option>
                                                                        <option value="Stanley, Falkland Islands (Malvinas)" title="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option>
                                                                        <option value="Tórshavn" title="Faroe Islands">Faroe Islands</option>
                                                                        <option value="Suva" title="Fiji">Fiji</option>
                                                                        <option value="Helsinki" title="Finland">Finland</option>
                                                                        <option value="Paris" title="France">France</option>
                                                                        <option value="Cayenne" title="French Guiana">French Guiana</option>
                                                                        <option value="Papeete" title="French Polynesia">French Polynesia</option>
                                                                        <option value="Saint-Pierre, Réunion" title="French Southern Territories">French Southern Territories</option>
                                                                        <option value="Libreville" title="Gabon">Gabon</option>
                                                                        <option value="Banjul" title="Gambia">Gambia</option>
                                                                        <option value="Tbilisi" title="Georgia">Georgia</option>
                                                                        <option value="Berlin" title="Germany">Germany</option>
                                                                        <option value="Accra" title="Ghana">Ghana</option>
                                                                        <option value="Gibraltar" title="Gibraltar">Gibraltar</option>
                                                                        <option value="Athens" title="Greece">Greece</option>
                                                                        <option value="Nuuk" title="Greenland">Greenland</option>
                                                                        <option value="Saint George's" title="Grenada">Grenada</option>
                                                                        <option value="Basse-Terre" title="Guadeloupe">Guadeloupe</option>
                                                                        <option value="Hagåtña" title="Guam">Guam</option>
                                                                        <option value="Guatemala City" title="Guatemala">Guatemala</option>
                                                                        <option value="Saint Peter Port, Guernsey" title="Guernsey">Guernsey</option>
                                                                        <option value="Conakry" title="Guinea">Guinea</option>
                                                                        <option value="Bissau" title="Guinea-Bissau">Guinea-Bissau</option>
                                                                        <option value="Georgetown" title="Guyana">Guyana</option>
                                                                        <option value="Port-au-Prince" title="Haiti">Haiti</option>
                                                                        <option value="Heard Island and McDonald Islands" title="Heard Island and McDonald Islands">Heard Island and McDonald Islands</option>
                                                                        <option value="Tegucigalpa" title="Honduras">Honduras</option>
                                                                        <option value="Hong Kong" title="Hong Kong">Hong Kong</option>
                                                                        <option value="Budapest" title="Hungary">Hungary</option>
                                                                        <option value="Reykjavik" title="Iceland">Iceland</option>
                                                                        <option value="New Delhi" title="India">India</option>
                                                                        <option value="Jakarta" title="Indonesia">Indonesia</option>
                                                                        <option value="Tehran" title="Iran, Islamic Republic of">Iran, Islamic Republic of</option>
                                                                        <option value="Baghdad" title="Iraq">Iraq</option>
                                                                        <option value="Dublin" title="Ireland">Ireland</option>
                                                                        <option value="Douglas, Isle of Man" title="Isle of Man">Isle of Man</option>
                                                                        <option value="Jerusalem" title="Israel">Israel</option>
                                                                        <option value="Rome" title="Italy">Italy</option>
                                                                        <option value="Kingston" title="Jamaica">Jamaica</option>
                                                                        <option value="Tokyo" title="Japan">Japan</option>
                                                                        <option value="Saint Helier" title="Jersey">Jersey</option>
                                                                        <option value="Amman" title="Jordan">Jordan</option>
                                                                        <option value="Astana" title="Kazakhstan">Kazakhstan</option>
                                                                        <option value="Nairobi" title="Kenya">Kenya</option>
                                                                        <option value="Tarawa Atoll" title="Kiribati">Kiribati</option>
                                                                        <option value="Pyongyang" title="Korea, Democratic People's Republic of">Korea, Democratic People's Republic of</option>
                                                                        <option value="Seoul" title="Korea, Republic of">Korea, Republic of</option>
                                                                        <option value="Pristina" title="Kosovo ">Kosovo </option>
                                                                        <option value="Kuwait City" title="Kuwait">Kuwait</option>
                                                                        <option value="Bishkek" title="Kyrgyzstan">Kyrgyzstan</option>
                                                                        <option value="Vientiane" title="Lao People's Democratic Republic">Lao People's Democratic Republic</option>
                                                                        <option value="Vientiane" title="Laos ">Laos </option>
                                                                        <option value="Riga" title="Latvia">Latvia</option>
                                                                        <option value="Beirut" title="Lebanon">Lebanon</option>
                                                                        <option value="Maseru" title="Lesotho">Lesotho</option>
                                                                        <option value="Monrovia" title="Liberia">Liberia</option>
                                                                        <option value="Tripoli" title="Libya">Libya</option>
                                                                        <option value="Vaduz" title="Liechtenstein">Liechtenstein</option>
                                                                        <option value="Vilnius" title="Lithuania">Lithuania</option>
                                                                        <option value="Luxembourg" title="Luxembourg">Luxembourg</option>
                                                                        <option value="Macau" title="Macau ">Macau </option>
                                                                        <option value="Skopje" title="Macedonia, the former Yugoslav Republic of">Macedonia, the former Yugoslav Republic of</option>
                                                                        <option value="Antananarivo" title="Madagascar">Madagascar</option>
                                                                        <option value="Lilongwe" title="Malawi">Malawi</option>
                                                                        <option value="Kuala Lumpur" title="Malaysia">Malaysia</option>
                                                                        <option value="Male" title="Maldives">Maldives</option>
                                                                        <option value="Bamako" title="Mali">Mali</option>
                                                                        <option value="Valletta" title="Malta">Malta</option>
                                                                        <option value="Majuro" title="Marshall Islands">Marshall Islands</option>
                                                                        <option value="Fort-de-France" title="Martinique">Martinique</option>
                                                                        <option value="Nouakchott" title="Mauritania">Mauritania</option>
                                                                        <option value="Port Louis" title="Mauritius">Mauritius</option>
                                                                        <option value="Mamoudzou" title="Mayotte">Mayotte</option>
                                                                        <option value="Mexico City" title="Mexico">Mexico</option>
                                                                        <option value="Palikir" title="Micronesia, Federated States of">Micronesia, Federated States of</option>
                                                                        <option value="Chisinau" title="Moldova, Republic of">Moldova, Republic of</option>
                                                                        <option value="Monaco" title="Monaco">Monaco</option>
                                                                        <option value="Ulaanbaatar" title="Mongolia">Mongolia</option>
                                                                        <option value="Podgorica" title="Montenegro">Montenegro</option>
                                                                        <option value="Plymouth" title="Montserrat">Montserrat</option>
                                                                        <option value="Rabat" title="Morocco">Morocco</option>
                                                                        <option value="Maputo" title="Mozambique">Mozambique</option>
                                                                        <option value="Rangoon " title="Myanmar">Myanmar</option>
                                                                        <option value="Windhoek" title="Namibia">Namibia</option>
                                                                        <option value="Yaren District" title="Nauru">Nauru</option>
                                                                        <option value="Kathmandu" title="Nepal">Nepal</option>
                                                                        <option value="Amsterdam" title="Netherlands">Netherlands</option>
                                                                        <option value="Nouméa" title="New Caledonia">New Caledonia</option>
                                                                        <option value="Wellington" title="New Zealand">New Zealand</option>
                                                                        <option value="Managua" title="Nicaragua">Nicaragua</option>
                                                                        <option value="Niamey" title="Niger">Niger</option>
                                                                        <option value="Abuja" title="Nigeria">Nigeria</option>
                                                                        <option value="Alofi" title="Niue">Niue</option>
                                                                        <option value="Kingston, Norfolk Island" title="Norfolk Island">Norfolk Island</option>
                                                                        <option value="Capitol Hill, Saipan" title="Northern Mariana Islands">Northern Mariana Islands</option>
                                                                        <option value="Oslo" title="Norway">Norway</option>
                                                                        <option value="Muscat" title="Oman">Oman</option>
                                                                        <option value="Islamabad" title="Pakistan">Pakistan</option>
                                                                        <option value="Melekeok" title="Palau">Palau</option>
                                                                        <option value="Jerusalem, Ramallah, Gaza City" title="Palestinian Territory, Occupied">Palestinian Territory, Occupied</option>
                                                                        <option value="Panama City" title="Panama">Panama</option>
                                                                        <option value="Port Moresby" title="Papua New Guinea">Papua New Guinea</option>
                                                                        <option value="Asuncion" title="Paraguay">Paraguay</option>
                                                                        <option value="Lima" title="Peru">Peru</option>
                                                                        <option value="Manila" title="Philippines">Philippines</option>
                                                                        <option value="Adamstown" title="Pitcairn">Pitcairn</option>
                                                                        <option value="Warsaw" title="Poland">Poland</option>
                                                                        <option value="Lisbon" title="Portugal">Portugal</option>
                                                                        <option value="San Juan" title="Puerto Rico">Puerto Rico</option>
                                                                        <option value="Doha" title="Qatar">Qatar</option>
                                                                        <option value="Saint-Denis" title="Réunion">Réunion</option>
                                                                        <option value="Bucharest" title="Romania">Romania</option>
                                                                        <option value="Moscow" title="Russian Federation">Russian</option>
                                                                        <option value="Kigali" title="Rwanda">Rwanda</option>
                                                                        <option value="Gustavia, Saint Barthélemy" title="Saint Barthélemy">Saint Barthélemy</option>
                                                                        <option value="Jamestown" title="Saint Helena, Ascension and Tristan da Cunha">Saint Helena, Ascension and Tristan da Cunha</option>
                                                                        <option value="Basseterre" title="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                                                        <option value="Castries" title="Saint Lucia">Saint Lucia</option>
                                                                        <option value="Marigot" title="Saint Martin (French part)">Saint Martin (French part)</option>
                                                                        <option value="Saint Pierre and Miquelon" title="Saint Pierre and Miquelon">Saint Pierre and Miquelon</option>
                                                                        <option value="Kingstown, Saint Vincent and the Grenadines" title="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                                                        <option value="Apia" title="Samoa">Samoa</option>
                                                                        <option value="San Marino" title="San Marino">San Marino</option>
                                                                        <option value="Sao Tome" title="Sao Tome and Principe">Sao Tome and Principe</option>
                                                                        <option value="Riyadh" title="Saudi Arabia">Saudi Arabia</option>
                                                                        <option value="Dakar" title="Senegal">Senegal</option>
                                                                        <option value="Belgrade" title="Serbia">Serbia</option>
                                                                        <option value="Victoria" title="Seychelles">Seychelles</option>
                                                                        <option value="Freetown" title="Sierra Leone">Sierra Leone</option>
                                                                        <option value="Singapore" title="Singapore">Singapore</option>
                                                                        <option value="Philipsburg (Dutch part)" title="Sint Maarten (Dutch part)">Sint Maarten (Dutch part)</option>
                                                                        <option value="Bratislava" title="Slovakia">Slovakia</option>
                                                                        <option value="Ljubljana" title="Slovenia">Slovenia</option>
                                                                        <option value="Honiara" title="Solomon Islands">Solomon Islands</option>
                                                                        <option value="Mogadishu" title="Somalia">Somalia</option>
                                                                        <option value="Cape Town" title="South Africa">South Africa</option>
                                                                        <option value="King Edward Point" title="South Georgia and the South Sandwich Islands">South Georgia and the South Sandwich Islands</option>
                                                                        <option value="Juba " title="South Sudan">South Sudan</option>
                                                                        <option value="Madrid" title="Spain">Spain</option>
                                                                        <option value="Colombo" title="Sri Lanka">Sri Lanka</option>
                                                                        <option value="Khartoum" title="Sudan">Sudan</option>
                                                                        <option value="Paramaribo" title="Suriname">Suriname</option>
                                                                        <option value="Longyearbyen" title="Svalbard and Jan Mayen">Svalbard and Jan Mayen</option>
                                                                        <option value="Mbabane" title="Swaziland">Swaziland</option>
                                                                        <option value="Stockholm" title="Sweden">Sweden</option>
                                                                        <option value="Bern" title="Switzerland">Switzerland</option>
                                                                        <option value="Damascus" title="Syria">Syria</option>
                                                                        <option value="Taipei" title="Taiwan">Taiwan</option>
                                                                        <option value="Dushanbe" title="Tajikistan">Tajikistan</option>
                                                                        <option value="Dar es Salaam" title="Tanzania, United Republic of">Tanzania, United Republic of</option>
                                                                        <option value="Bangkok" title="Thailand">Thailand</option>
                                                                        <option value="Dili" title="Timor-Leste">Timor-Leste</option>
                                                                        <option value="Lome" title="Togo">Togo</option>
                                                                        <option value="Atafu" title="Tokelau">Tokelau</option>
                                                                        <option value="Nuku'alofa" title="Tonga">Tonga</option>
                                                                        <option value="Port-of-Spain, Trinidad and Tobago" title="Trinidad and Tobago">Trinidad and Tobago</option>
                                                                        <option value="Tunis" title="Tunisia">Tunisia</option>
                                                                        <option value="Ankara" title="Turkey">Turkey</option>
                                                                        <option value="Ashgabat" title="Turkmenistan">Turkmenistan</option>
                                                                        <option value="Cockburn Town" title="Turks and Caicos Islands">Turks and Caicos Islands</option>
                                                                        <option value="Vaiaku village" title="Tuvalu">Tuvalu</option>
                                                                        <option value="Kampala" title="Uganda">Uganda</option>
                                                                        <option value="Kyiv" title="Ukraine">Ukraine</option>
                                                                        <option value="Abu Dhabi" title="United Arab Emirates">United Arab Emirates</option>
                                                                        <option value="London" title="United Kingdom">United Kingdom</option>
                                                                        <option value="Washington D.C." title="United States of America">United States of America</option>
                                                                        <option value="Montevideo" title="Uruguay">Uruguay</option>
                                                                        <option value="Tashkent" title="Uzbekistan">Uzbekistan</option>
                                                                        <option value="Port-Vila" title="Vanuatu">Vanuatu</option>
                                                                        <option value="Vatican City" title="Vatican City">Vatican City</option>
                                                                        <option value="Caracas" title="Venezuela">Venezuela</option>
                                                                        <option value="Hanoi" title="Vietnam">Vietnam</option>
                                                                        <option value="Road Town, Virgin Islands, British" title="Virgin Islands, British">Virgin Islands, British</option>
                                                                        <option value="Charlotte Amalie" title="Virgin Islands, U.S.">Virgin Islands, U.S.</option>
                                                                        <option value="Mata Utu" title="Wallis and Futuna">Wallis and Futuna</option>
                                                                        <option value="El-Aaiún" title="Western Sahara">Western Sahara</option>
                                                                        <option value="Sanaa" title="Yemen">Yemen</option>
                                                                        <option value="Lusaka" title="Zambia">Zambia</option>
                                                                        <option value="Harare" title="Zimbabwe">Zimbabwe</option>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label htmlFor="selectGender" className="control-label">Gender</label>
                                                                    <Select className="form-control" valueLink={gender}>
                                                                        <option value="" selected hidden>Gender</option>
                                                                        <option value="Male">Male</option>
                                                                        <option value="Female">Female</option>
                                                                        <option value="Other">Other</option>
                                                                    </Select>
                                                                    <small className="text-danger">{gender.error}</small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label htmlFor="selectUserType" className="control-label">User Type</label>
                                                                    <Select className="form-control" valueLink={userType}>
                                                                        <option value="" selected hidden>User Type</option>
                                                                        <option value="1">General Customer</option>
                                                                        <option value="2">Business Owner</option>
                                                                        {this.state.userType === 3 &&(
                                                                            <option value="3">Admin</option>
                                                                        )}
                                                                    </Select>
                                                                    <small className="text-danger">{userType.error}</small>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <label htmlFor="inputDate" className="control-label">Date of Birth</label>
                                                                    <Input className="form-control" type="date" max={this.state.currentDate} valueLink={DOB}/>
                                                                    <small className="text-danger" >{DOB.error}</small>
                                                                </div>
                                                            </div>
                                                            <br/>
                                                            <div className="text-center">
                                                                <div className="btn-group">
                                                                    <button className="btn btn-success" disabled={username.error || email.error || password.error || repassword.error || phonenum.error || city.error || gender.error || userType.error || DOB.error} onClick={this.onSubmit}>Submit</button>
                                                                    <button className="btn btn-primary" onClick={this.noChange}>Go Back</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {this.state.updateSuccess && (
                                                        <div className="row">
                                                            <div className="col-md-2"></div>
                                                            <div className="col-md-8">
                                                                <div className="alert alert-success text-center">
                                                                    <strong>Update Successful!<h3><span role="img" aria-label="success">&#x2705;</span></h3></strong>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.redirect && (
                    <Redirect push to="/Home"/>
                )}
                {this.state.redirectOnLogout && (
                    <Redirect push to="/Login"/>
                )}
                {this.state.redirectOnInitialPage && (
                    <Redirect push to="/"/>
                )}
                {this.state.redirectSearchTerm && (
                    <Redirect push to={{pathname: "/SearchedTerm/" + this.state.searchTerm}}/>
                )}
            </div>
        )
    }
}

export default ViewAccount;