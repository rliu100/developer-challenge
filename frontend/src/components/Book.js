import React from 'react';
import { Card } from 'antd';
import book1 from '../img/pinocchio.jpeg';
import book2 from '../img/narnia.jpeg';
import book3 from '../img/the_little_prince.jpeg';
import book4 from '../img/harry_potter.jpeg';
import book5 from "../img/Alice's_Adventures_in_Wonderland.jpeg";

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
    // console.log("totalStars: ", totalStars);
    // console.log("totalReviews: ", totalReviews);
    rating = `${averageRating} from ${totalReviews} reviews`;
  }

  return (
    <Card title={props.title} style={{ width: 380 }}>
      <p>{props.author}</p>
      <div>
        <img height="200" src={bookCovers[id]} />
      </div>
      <p>{rating}</p>
    </Card>
  )
}

export default Book;