import React from 'react';
import { FaLongArrowAltLeft } from "react-icons/fa";
import { Link, NavLink } from 'react-router-dom';

function AddGaurds() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl mb-4 flex items-center gap-2">
        <NavLink to="/managepeople"> <FaLongArrowAltLeft className="text-2xl" /> </NavLink> 
        Add User
      </h2>
      <form className="space-y-8">
        {/* General Info */}
        <div className="bg-white shadow-md p-6 rounded-md">
          <h3 className="text-xl mb-4">General Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="First Name*"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Last Name*"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Guard ID*"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Short Name*"
            />
            <select className="p-3 border rounded-md text-lg">
              <option>Status*</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white shadow-md p-6 rounded-md">
          <h3 className="text-xl mb-4">Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="p-3 border rounded-md text-lg"
              type="date"
              placeholder="Date of Birth"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="SIN"
            />
            <select className="p-3 border rounded-md text-lg">
              <option>Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Ethnicity"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Hair Color"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Eye Color"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Height (m)"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Weight (lbs)"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Marital Status"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Dependents"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Emergency Contact"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Emergency Contact Phone"
            />
          </div>
        </div>

        {/* Hiring History */}
        <div className="bg-white shadow-md p-6 rounded-md">
          <h3 className="text-xl mb-4">Hiring History</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="p-3 border rounded-md text-lg"
              type="date"
              placeholder="Start Date"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="date"
              placeholder="End Date"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Termination Reason"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="text"
              placeholder="Employment Insurance"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="date"
              placeholder="Next Review"
            />
            <input
              className="p-3 border rounded-md text-lg"
              type="date"
              placeholder="Last Review"
            />
          </div>
        </div>

        {/* Max Hours */}
        <div className="bg-white shadow-md p-6 rounded-md">
          <h3 className="text-xl mb-4">Max Hours</h3>
          <div>
            <label className="flex items-center space-x-3 mb-4">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-lg">Use daily max hours</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <input
                  key={day}
                  className="p-3 border rounded-md text-lg"
                  type="number"
                  placeholder={day}
                />
              ))}
              <input
                className="p-3 border rounded-md text-lg"
                type="date"
                placeholder="Effective Date"
              />
            </div>
          </div>
          <label className="flex items-center space-x-3 mt-4">
            <input type="checkbox" className="form-checkbox" />
            <span className="text-lg font-semibold">Use weekly max hours</span>
          </label>
          <label className="flex items-center space-x-3 mt-4">
            <input type="checkbox" className="form-checkbox" />
            <span className="text-lg font-semibold">Use monthly max hours</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex  justify-center space-x-6">
          <NavLink to="/managepeople">
            <button
              type="button"
              className="px-6 py-3 bg-gray-300 rounded-md text-lg font-bold"
            >
              Cancel
            </button>
          </NavLink>
          <button
            type="submit"
            className="px-6 py-3 text-white rounded-md text-lg font-bold yellow-color"
          >
            Submit
          </button>
        </div>
      </form>
    </div>

  );
}

export default AddGaurds;
