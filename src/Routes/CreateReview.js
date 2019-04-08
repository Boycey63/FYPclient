import React, { Component } from "react";
import { Redirect } from 'react-router';
import axios from "axios/index";
import "./CSS/ExtraCss.css";
import Link from 'valuelink';
import { Input, Select, TextArea} from 'valuelink/tags';

let jwt = require('jsonwebtoken');

class WriteReview extends Component {

    constructor() {
        super();
        this.state = {
            reviewText: '',
            score: 0,
            redirect: false,
            redirectHome: false,
            redirectToReviewedBusiness: false,
            redirectOnInitialPage: false,
            starRating:'',
            signedIn: false,
            userDetails: [],
            reviewTitle:'',
            companyDetails: [],
            businessID: '',
            searchValue: '',
            reviewedBusiness: '',
            redirectToBusiness: false,
            userLocation:'',
            displayError:false,
            processingReview:false,
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
            self.setState({ redirect: true });
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
                            redirect: true
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
    }

    onSubmit = (e) =>{
        e.preventDefault();
        let self = this;
        let reviewSuccess = () => {
            self.setState({redirectToReviewedBusiness: true});
        };

        this.setState({
            processingReview:true,
        });

        axios({
            method: 'post',
            url: '/classify/test',
            data: {
                text: this.state.reviewText
            }
        }).then(function (res) {
            if(res.data.length > 0) {
                self.setState({
                    starRating:res.data,
                });
                axios({
                    method: 'post',
                    url: '/insert/review',
                    data: {
                        reviewTitle: self.state.reviewTitle.replace(/'/g, ''),
                        Stars: self.state.starRating,
                        ReviewText: self.state.reviewText.replace(/'/g, ''),
                        businessID: self.state.businessID,
                        userID: self.state.userDetails.user.id,
                    }
                }).then(function (response) {
                    if(response.data === 'success') {
                        axios({
                            method: 'post',
                            url: '/select/oneBusinessByID',
                            data: {
                                businessID: self.state.businessID,
                            }
                        }).then(function (res) {
                            self.setState({
                                reviewedBusiness: res.data[0].companyName,
                                processingReview:false,
                                loginSuccess: true,
                            });
                            setTimeout(reviewSuccess, 2000);
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                    else{
                        self.setState({
                            displayError: true,
                        })
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            }
        }).catch(function (error) {
            console.log(error);
        });
    };

    back = () =>{
        this.setState({
            redirectHome: true,
        });
    };

    render() {
        let titleWordsCount = this.state.reviewTitle.trim().split(/\s+/);
        let reviewWordsCount = this.state.reviewText.trim().split(/\s+/);
        const businessID = Link.state(this, 'businessID')
            .check( x => x, 'Must select a business');
        const reviewTitle = Link.state(this, 'reviewTitle')
            .check( x => x, 'A review title is required')
            .check( x => titleWordsCount.length >= 5, 'Title must have at least 5 words')
            .check( x => titleWordsCount.length <= 20, 'Title must have less than 20 words');

        const reviewText = Link.state(this, 'reviewText')
            .check( x => x, 'Review text input is required')
            .check( x => reviewWordsCount.length >= 15, 'Title must have at least 15 words')
            .check( x => reviewWordsCount.length <= 150, 'Title must have less than 150 words');


        return (
            <div className="container">
                <div className="col-xs-12 col-sm-12 col-md-12">

                        <form className="form-horizontal" id="transparentBack">
                            <br/>
                            {this.state.loginSuccess && (
                                <div className="row">
                                    <div className="col-md-2"></div>
                                    <div className="col-md-8">
                                        <div className="alert alert-success text-center">
                                            <strong>Review was Successful!<h3><span role="img" aria-label="success">&#x2705;</span></h3></strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {this.state.processingReview &&(
                                <div>
                                    <div className="text-center">
                                        <h4>Your Review is being processed!</h4>
                                        <p>This could take a second or two</p>
                                        <div id="processReview">
                                            <div className="progress progress-striped active"  style={{width:'80%',"marginLeft":'auto',"marginRight":'auto'}}>
                                                <div className="progress-bar progress-bar-success"  style={{width:'100%'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!this.state.loginSuccess && !this.state.processingReview && (
                                <fieldset>
                                    <legend className="text-center">Write A Review</legend>
                                    <br/>
                                    {this.state.displayError &&(
                                        <div className="alert alert-dismissible alert-danger">
                                            <strong>Something went wrong, please try refresh the page and try again.</strong>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-2"></div>
                                        <div className="form-group col-md-8">
                                                <label htmlFor="selectBusiness" className="control-label">Business</label>
                                                <Select className="form-control" valueLink={businessID}>
                                                    <option value="" selected disabled hidden>Choose Business</option>
                                                    {this.state.companyDetails.map(companyDetail =>
                                                        <option key = {companyDetail.businessID} value={companyDetail.businessID}>{companyDetail.companyName}</option>
                                                    )}
                                                </Select>
                                                <small className="text-danger">{businessID.error}</small>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-2"></div>
                                        <div className="form-group col-md-8">
                                            <label htmlFor="reviewTitle" className="control-label">Review Title</label>
                                            <Input className="form-control" id="reviewTitle" valueLink={reviewTitle} type="text" placeholder="ReviewTitle"/>
                                            <small id="reviewTitleHelp" className="text-danger">{reviewTitle.error}</small>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-2"></div>
                                        <div className="form-group col-md-8">
                                            <label htmlFor="reviewText" className="control-label">Review Text</label>
                                            <TextArea className="form-control" rows="7" cols="50" id="textArea" valueLink={reviewText} placeholder="Type your review here..."/>
                                            <small id="reviewTextHelp" className="text-danger">{reviewText.error}</small>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="btn-group">
                                            <button className="btn btn-success" onClick={this.onSubmit} disabled={businessID.error || reviewTitle.error || reviewText.error}>Submit</button>
                                            <button className="btn btn-danger" onClick={this.back}>Go Back</button>
                                        </div>
                                    </div>

                                    <br/>
                                    </fieldset>
                            )}
                            </form>
                    {this.state.redirectToBusiness && (
                        <Redirect push to={{pathname: "/SingleBusiness/" + this.state.searchValue}}/>
                    )}
                    {this.state.redirectToReviewedBusiness && (
                        <Redirect push to={{pathname: "/SingleBusiness/" + this.state.reviewedBusiness}}/>
                    )}
                    {this.state.redirect && (
                        <Redirect push to="/Login"/>
                    )}
                    {this.state.redirectHome && (
                        <Redirect push to="/Home"/>
                    )}
                    {this.state.redirectOnInitialPage && (
                        <Redirect push to={{pathname: "/"}}/>
                    )}
                </div>
            </div>
        );
    }
}

export default WriteReview;