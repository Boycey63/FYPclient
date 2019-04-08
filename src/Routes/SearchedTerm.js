import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import axios from "axios/index";
import { Input } from 'valuelink/tags';
import Link from "valuelink/lib/index";
let jwt = require('jsonwebtoken');

class SearchedTerm extends Component {


    constructor() {
        super();
        this.state = {
            companyDetails: [],
            signedIn: false,
            userDetails: [],
            searchValue: '',
            redirectToBusiness: false,
            redirectOnLogout: false,
            redirectOnInitialPage: false,
            userLocation: '',
            categorys: [],
            updated: false,
            noBusinesses: false,
            setFilter: '',
            currentSearchTerm: '',
            searchTerm: '',
            redirectSearchTerm: false,
        };
    }

    //Run when component mounts
    componentDidMount() {
        //Checks if there is a location token
        if (!localStorage.getItem('location')) {
            this.setState({
                //If not redirect to the start page
                redirectOnInitialPage: true,
            });
        } else {
            this.setState({
                userLocation: localStorage.getItem('location'),
                currentSearchTerm: this.props.match.params.searchterm,
            });
        }

        //Gets the authentication token
        let retrievedObject = localStorage.getItem('userToken');
        let tokenValue = JSON.parse(retrievedObject);
        let self = this;

        //Sets the user to not signed in and changes the navigation bar
        if(retrievedObject === null){
            self.setState({ signedIn: false });
            document.getElementById("checkLogin").style.visibility = "visible";
        }else{
            //Send token to backend to be checked for validation
            axios({
                method: 'post',
                url: '/authentication/checkToken',
                headers:{
                    'Authorization': "Bearer " + tokenValue.token,
                }
            }).then(function (res) {
                //Sets the user type for all the user specific functionality
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
                }else{
                    self.setState({ signedIn: false });
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).catch(function (error) {
                console.log(error);
            });
        }

        //Searched For businesses with the specified search term
        axios({
            method: 'post',
            url: '/select/searchTerm',
            data:{
                searchTerm:self.props.match.params.searchterm,
            }
        })
            .then(function (res) {

                if(res.data.length > 0) {
                    self.setState({
                        companyDetails: res.data,
                    });
                    let node = document.createElement("p");
                    node.className = "lead";
                    let textnode = document.createTextNode("All businesses relating to '" + self.state.currentSearchTerm + "'");
                    document.getElementById("header").className = "text-success text-center";
                    node.appendChild(textnode);
                    document.getElementById("header").appendChild(node);
                }else{
                    let node = document.createElement("p");
                    node.className = "lead";
                    let textnode = document.createTextNode("There were no business relating to '" + self.state.currentSearchTerm + "'");
                    document.getElementById("header").className = "text-danger text-center";
                    node.appendChild(textnode);
                    document.getElementById("header").appendChild(node);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //Searches the search term
    searchForBusiness = (e) =>{
        e.preventDefault();
        let self = this;
        self.setState({
            redirectSearchTerm: true,
            currentSearchTerm: self.state.searchTerm,
        });

        //Sends the search term to server
        axios({
            method: 'post',
            url: '/select/searchTerm',
            data:{
                searchTerm:self.state.searchTerm,
            }
        })
            .then(function (res) {
                //Change display to success
                if(res.data.length > 0) {
                    self.setState({
                        companyDetails: res.data,
                        noBusinesses: false,
                    });
                    let header = document.getElementById("header");
                    header.removeChild(header.childNodes[0]);
                    let node = document.createElement("p");
                    node.className = "lead";
                    let textnode = document.createTextNode("All businesses relating to '" + self.state.searchTerm + "'");
                    document.getElementById("header").className = "text-success text-center";
                    node.appendChild(textnode);
                    document.getElementById("header").appendChild(node);
                    self.setState({
                        searchTerm: '',
                    });
                }
                //Change display to fail
                else{
                    self.setState({noBusinesses: true});
                    let header = document.getElementById("header");
                    header.removeChild(header.childNodes[0]);
                    let node = document.createElement("p");
                    node.className = "lead";
                    let textnode = document.createTextNode("There were no business relating to '" + self.state.searchTerm + "'");
                    document.getElementById("header").className = "text-danger text-center";
                    node.appendChild(textnode);
                    document.getElementById("header").appendChild(node);
                    self.setState({
                        searchTerm: '',
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    //Logout function
    Logout = () =>{
        localStorage.removeItem("userToken");
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        const searchTerm =Link.state(this, 'searchTerm').check( x => x );

        return (
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
                            <NavLink exact to="/Home" className="navbar-brand ">The Little Guys</NavLink>
                        </div>

                        <div className="navbar-collapse collapse" id="bs-example-navbar-collapse-2" aria-expanded="true">

                            <ul className="nav navbar-nav">
                                <li><NavLink exact to="/Home">Home</NavLink> <span className="sr-only">(current)</span></li>
                                <li><NavLink exact to="/RecentReviews">Recent Reviews</NavLink></li>
                                <li><NavLink exact to="/AllBusinesses">All Businesses</NavLink></li>
                                <li><NavLink exact to="/SearchArea">Search Area</NavLink></li>
                            </ul>

                            <form className="navbar-form navbar-left" role="search">
                                <div className="input-group">
                                    <Input type="text" className="form-control" placeholder="Search" valueLink={searchTerm}/>
                                    {searchTerm.error &&(
                                        <span className="input-group-btn"><button disabled={searchTerm.error} className="btn btn-default">Submit</button></span>
                                    )}
                                    {!searchTerm.error &&(
                                        <span className="input-group-btn"><button onClick={this.searchForBusiness} className="btn btn-success">Submit</button></span>
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
                    <div className="row">
                        <div className="col-md-2">
                        </div>
                        <div className="col-md-8" id="transparentBack">
                            <h3 className="text-center">Search results</h3>

                            <br/>
                            <div className="text-center" id="header">
                            </div>

                            {!this.state.noBusinesses && (
                                <div>
                                    {this.state.companyDetails.map(companyDetail =>
                                        <div key ={companyDetail.companyName}  className="panel-group">
                                            <div className="panel  panel-primary">
                                                <div className="panel-heading">
                                                    <div className="panel-title">
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="col-sm-6 col-md-6">
                                                                    <h4 id="panel-header-text" key ={companyDetail.companyName}>{"Company: " + companyDetail.companyName}</h4>
                                                                </div>
                                                                <div className="col-sm-6 col-md-6">
                                                                    <a  data-toggle="collapse" key ={companyDetail.companyName}  href={"#" + companyDetail.companyName} className="btn btn-default pull-right">Expand</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div key ={companyDetail.companyName}  id={companyDetail.companyName} className="panel-collapse collapse">
                                                    <div className="panel-body">
                                                        <p className="hidden-lg hidden-md hidden-sm visible-xs">Scroll left to see content</p>
                                                        <div className="table-responsive">
                                                            <table className="table table-striped" id="showBorder">
                                                                <tbody>
                                                                <tr>
                                                                    <td width="20%">Business Owner</td>
                                                                    <td key ={companyDetail.companyName}>{companyDetail.ownerName}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Business Category</td>
                                                                    <td key ={companyDetail.companyName}>{companyDetail.categoryName}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Year Established</td>
                                                                    <td key ={companyDetail.companyName}>{companyDetail.formYearEst}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Address</td>
                                                                    <td key ={companyDetail.companyName} >{companyDetail.address}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Business Number</td>
                                                                    <td key ={companyDetail.companyName}>{companyDetail.companyNum}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Business Email</td>
                                                                    <td key ={companyDetail.companyName}>{companyDetail.companyEmail}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Business Description</td>
                                                                    <td key ={companyDetail.companyName}>{companyDetail.description}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Added to the website</td>
                                                                    <td key ={companyDetail.companyName} >{companyDetail.formCreationDate}</td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="text-center">
                                                            <NavLink key ={companyDetail.companyName}  exact to={"/SingleBusiness/" + companyDetail.companyName} className="btn btn-warning btn-sm">Go To Page</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {this.state.redirectOnLogout && (
                    <Redirect push to={{pathname: "/Login"}}/>
                )}
                {this.state.redirectToBusiness && (
                    <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                )}
                {this.state.redirectOnInitialPage && (
                    <Redirect push to={{pathname: "/"}}/>
                )}
                {this.state.redirectSearchTerm && (
                    <Redirect push to={{pathname: "/SearchedTerm/" + this.state.currentSearchTerm}}/>
                )}
            </div>
        );

    }
};

export default SearchedTerm;