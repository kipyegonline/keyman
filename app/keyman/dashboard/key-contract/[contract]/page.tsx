import React from "react";

export default function page({ params }) {
  return (
    <div>
      <h1>Contract ID: {params.contract}</h1>
    </div>
  );
}
