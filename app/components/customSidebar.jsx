import React from "react";
import {Link, useNavigate} from "@remix-run/react";
import {Icon} from "@shopify/polaris";
import './css/style.css'
import {
  HomeIcon, OrderIcon, PersonFilledIcon
} from "@shopify/polaris-icons";

export default function CustomSidebar() {
  const navigate = useNavigate();
  return (
    <>
      <div className="sidebar">
        <div className="sidebar-top">
          <Link to='/app'><Icon source={HomeIcon}/></Link>
        </div>
        <div className="sidebar-content">
          <ul className='list'>
            <li className='list-item'>
              <Link to='/app/customer' className='list-item-inside'>
                <Icon className='icon' source={PersonFilledIcon}/>
                <span className='span-item-inside'>Customer</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
