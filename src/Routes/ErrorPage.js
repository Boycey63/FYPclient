import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import "./CSS/ExtraCss.css";

class ErrorPage extends Component {

    constructor() {
        super();
        this.state = {
            dbError: false,
        };
    }

    componentDidMount() {
        if (this.props.match.params.searchterm !== '') {
            this.setState({
                dbError: true,
            });
        }
    }

    render() {
        return (
            <div className="container">
                <div className="col-xs-12 col-sm-12 col-md-12">
                    <br/><br/>
                    <div className="col-md-2">
                    </div>
                    <div className="col-md-8" id="transparentBack">
                        {!this.state.dbError &&(
                            <div>
                                <div className="alert alert-danger text-center" id="errorHeight">
                                    <h3>You typed in the wrong url!</h3>
                                    <p>Please click the button below to redirect</p>
                                </div>
                                <div className="text-center">
                                    <NavLink  className="btn btn-primary" exact to="/">Redirect</NavLink>
                                </div>
                            </div>
                        )}
                        {this.state.dbError &&(
                            <div className="alert alert-danger text-center" id="errorHeight">
                                <h3>The Site is currently experiencing issues!</h3>
                                <p>We are working to try fix the problem</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorPage;