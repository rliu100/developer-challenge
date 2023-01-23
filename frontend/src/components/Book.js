import React from 'react';
import { Card } from 'antd';
import book1 from '../img/pinocchio.jpeg';
import book2 from '../img/narnia.jpeg';
import book3 from '../img/the_little_prince.jpeg';
import book4 from '../img/harry_potter.jpeg';
import book5 from "../img/Alice's_Adventures_in_Wonderland.jpeg";

import '../App.css';

const { Meta } = Card;

function Book(props) {
  let rating = "No reviews";
  const totalReviews = parseInt(props.totalReviews)
  const totalStars = parseInt(props.totalStars)
  const id = parseInt(props.id)

  const bookCovers = [
    book1, 
    book2, 
    book3,
    book4,
    book5
  ];

  if (totalReviews !== 0){
    let averageRating = parseFloat((totalStars/totalReviews).toFixed(2));
    rating = `${averageRating} from ${totalReviews} ratings`;
  }

  return (
    <Card 
      className='antd-card-title'
      // title={props.title} 
      cover={<img style={{objectFit: "cover"}} height="350" src={bookCovers[id]} alt={`${props.title} cover`}/>}
      style={{ width: 230 }}
    >
      <Meta 
        title={props.title} 
        description={
          <div>
             <p>{props.author}</p>
             <p>{rating}</p>
          </div>
        }
      />
      {/* <p>{props.author}</p>
      <div>
        <img height="200" src={bookCovers[id]} alt={`${props.title} cover`}/>
      </div>
      <p>{rating}</p> */}
    </Card>
  )
}

export default Book;