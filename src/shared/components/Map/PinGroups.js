import React, { Component } from 'react'

class PinGroups extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { cluster, onClick } = this.props;
        return(
                <div style={{backgroundColor:'#ffb50e',padding:10,borderRadius:50,width:40,height:40,textAlign:'center',cursor:'pointer'}} onClick={onClick}>
                    {cluster.properties.point_count}
                </div>
        )
    }
}

export default PinGroups;