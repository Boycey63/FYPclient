import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";
import { Redirect } from 'react-router';
import axios from "axios/index";
import { Input,Select } from 'valuelink/tags';
import Link from "valuelink/lib/index";
let jwt = require('jsonwebtoken');

class ReviewPage extends Component {


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
            userLocation:'',
            categorys: [],
            updated: false,
            noBusinesses: false,
            setFilter: '',
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
            self.setState({ signedIn: false });
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
                }else{
                    self.setState({ signedIn: false });
                }
                document.getElementById("checkLogin").style.visibility = "visible";
            }).catch(function (error) {
                console.log(error);
            });
        }

        axios({
            method: 'get',
            url: '/select/BusinessTable',
        })
            .then(function (res) {
                self.setState({companyDetails: res.data});
            })
            .catch(function (error) {
                console.log(error);
            });

        axios({
            method: 'get',
            url: '/select/categories',
        })
            .then(function (res) {
                self.setState({categorys: res.data});
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentDidUpdate(){
        document.getElementById("checkLogin").style.visibility = "visible";
    }

    inputChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    storeBusiness = (name) =>{
        localStorage.setItem('Business', JSON.stringify(name));
    };

    filterChange = () =>{
        let self = this;
        let updatedTimer = ()=>{
            self.setState({
                updated: false,
            });
        };

        self.setState({
            updated: true,
        });

        setTimeout(updatedTimer, 1500);
        if(this.state.filterValue !== '') {
            axios({
                method: 'post',
                url: '/select/businessFilter',
                data: {
                    filterValue: self.state.filterValue,
                }
            })
                .then(function (res) {
                    if (res.data.length > 0) {
                        self.setState({
                            companyDetails: res.data,
                            noBusinesses: false,
                        });
                    } else {
                        self.setState({
                            companyDetails: [],
                            noBusinesses: true,
                            setFilter: self.state.filterValue,
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }else{
            axios({
                method: 'get',
                url: '/select/BusinessTable',
            })
                .then(function (res) {
                    self.setState({
                        companyDetails: res.data,
                        noBusinesses: false,
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    searchForBusiness = (e) =>{
        e.preventDefault();
        this.setState({
            redirectSearchTerm: true,
        });
    };

    Logout = (e) =>{
        e.preventDefault();
        this.setState({
            redirectOnLogout: true,
        });
    };

    render() {
        const filterValue = Link.state(this, 'filterValue');
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
                                <li className="active"><NavLink exact to="/AllBusinesses">All Businesses</NavLink></li>
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
                    <div className="row">
                        <div className="col-md-2">
                            <label>Filter by Category</label>
                            <div className="input-group">
                                <Select className="form-control" valueLink={filterValue}>
                                    <option value="" selected>No Filter</option>
                                    {this.state.categorys.map(category =>
                                        <option key = {category.categoryID} value={category.categoryName}>{category.categoryName}</option>
                                    )}
                                </Select>
                                <span className="input-group-btn"><input type="button" className="btn btn-info" onClick={this.filterChange} value="Update"/></span>
                            </div>
                            {this.state.updated && (
                                <div className="row">
                                    <h6 className="text-success text-center"><strong>Updated!</strong></h6>
                                </div>
                            )}
                        </div>
                        <div className="col-md-8" id="transparentBack">
                            <h3 className="text-center">All Businesses</h3>
                            <br/>

                            {this.state.noBusinesses && (
                                <div>
                                    <div className="col-md-1"></div>
                                    <div className="col-md-10 alert alert-danger text-center">
                                            <strong>No businesses found with the filter {this.state.setFilter}, try a different filter!</strong>
                                    </div>
                                </div>
                            )}


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
                                                                <td>Added to the website</td>
                                                                <td key ={companyDetail.companyName} >{companyDetail.formCreationDate}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Business Description</td>
                                                                <td key ={companyDetail.companyName}>{companyDetail.description}</td>
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
                {this.state.redirectSearchTerm && (
                    <Redirect push to={{pathname: "/SearchedTerm/" + this.state.searchTerm}}/>
                )}
                {this.state.redirectOnInitialPage && (
                    <Redirect push to={{pathname: "/"}}/>
                )}
            </div>
        );
    }
}

export default ReviewPage;