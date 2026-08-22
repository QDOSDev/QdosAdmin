import React from "react";

const Loader = () => {
  return (
    <div className="screen_loader fixed inset-0  dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
      <div className="logo-loader">
        <div className="loaderlogo-wrapper">
          <img src="/assets/images/gym_logo.png" alt="Logo" className="loader-logo" width={"60px"} />
        </div>
      </div>
    </div>
  );
};



export default Loader;
