"use client";

import { useState } from "react";
import Header from "../../components/layout/clinic/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRunning,
  faBone,
  faHeartbeat,
  faMapMarkerAlt,
  faCertificate,
  faUniversity,
  faGlobe,
  faFileMedicalAlt,
  faUsers,
  faAward,
} from "@fortawesome/free-solid-svg-icons";

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing(!isEditing);

  const editableClass = isEditing ? "border border-primary p-1 rounded" : "";

  return (
    <>
      <Header />

      <main className="container mx-auto mt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Card */}
          <aside className="col-span-4 card text-center p-8 rounded-2xl shadow-lg">
            <img
            src="/Professional-Headshot-Examples-31-1.webp"
            alt="Doctor"
              className="w-40 h-40 rounded-full object-cover mx-auto mb-4 shadow-md"
            />
            <h2 contentEditable={isEditing} className={`text-xl font-semibold mb-1 ${editableClass}`}>
              Dr. Eleanor Vance, MD
            </h2>
            <p contentEditable={isEditing} className={`text-sm text-gray-500 mb-3 ${editableClass}`}>
              Orthopedic Surgeon <br /> <strong>Founder – Vance Orthopedic Clinic</strong>
            </p>

            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              <span className="tag">Orthopedics</span>
              <span className="tag">Sports Injury</span>
              <span className="tag">Rehabilitation</span>
            </div>

            <p contentEditable={isEditing} className={`text-sm text-gray-500 italic mb-5 ${editableClass}`}>
              “Every patient deserves time, clarity, and empathy in their healing journey.”
            </p>

            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="text-yellow-400 text-xl">★★★★★</span>
              <span className="text-sm text-gray-500">(4.9 / 5 · 120 reviews)</span>
            </div>

            <div className="flex justify-center gap-6 mb-5">
              <div className="text-center">
                <FontAwesomeIcon icon={faRunning} className="text-primary text-2xl" />
                <p contentEditable={isEditing} className={`text-xs text-gray-500 mt-1 ${editableClass}`}>
                  Sports Injuries
                </p>
              </div>
              <div className="text-center">
                <FontAwesomeIcon icon={faBone} className="text-primary text-2xl" />
                <p contentEditable={isEditing} className={`text-xs text-gray-500 mt-1 ${editableClass}`}>
                  Joint Care
                </p>
              </div>
              <div className="text-center">
                <FontAwesomeIcon icon={faHeartbeat} className="text-primary text-2xl" />
                <p contentEditable={isEditing} className={`text-xs text-gray-500 mt-1 ${editableClass}`}>
                  Rehabilitation
                </p>
              </div>
            </div>

            <div className="text-left text-gray-500 text-sm leading-relaxed">
              <p contentEditable={isEditing} className={editableClass}>
                <strong>Experience:</strong> 15 Years
              </p>
              <p contentEditable={isEditing} className={editableClass}>
                <strong>Languages:</strong> English, Hindi, Kannada
              </p>
              <p contentEditable={isEditing} className={editableClass}>
                <strong>Contact:</strong> +91-9876543210
              </p>
              <p contentEditable={isEditing} className={editableClass}>
                <strong>Email:</strong> dr.eleanor@pediatrack.in
              </p>
              <p contentEditable={isEditing} className={editableClass}>
                <strong>Location:</strong> <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" /> Indiranagar, Bangalore
              </p>
            </div>

            <div className="mt-4 text-left flex items-center gap-2">
              <FontAwesomeIcon icon={faCertificate} className="text-primary" />
              <span className="text-sm text-gray-500">Member, Indian Orthopaedic Association</span>
            </div>

            <button
              onClick={toggleEdit}
              className="mt-6 bg-primary text-white px-6 py-2 rounded-full font-medium shadow hover:opacity-90 transition-all"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>

            {/* Career / Roadmap */}
            <h2 className="text-lg text-primary mt-8 mb-4">Career Journey</h2>
            <div className="flex flex-col gap-4 text-left text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faUniversity} className="text-primary mt-1" />
                <div contentEditable={isEditing} className={editableClass}>
                  <strong>AIIMS, New Delhi</strong> – MBBS, MS (Orthopedics)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faGlobe} className="text-primary mt-1" />
                <div contentEditable={isEditing} className={editableClass}>
                  <strong>Johns Hopkins University</strong> – Fellowship in Sports Medicine
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faFileMedicalAlt} className="text-primary mt-1" />
                <div contentEditable={isEditing} className={editableClass}>
                  Published 12 papers on Musculoskeletal Rehabilitation
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-primary mt-1" />
                <div contentEditable={isEditing} className={editableClass}>
                  Member – Indian Orthopedic Association (IOA)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faAward} className="text-primary mt-1" />
                <div contentEditable={isEditing} className={editableClass}>
                  <strong>2021:</strong> National Healthcare Excellence Award
                </div>
              </div>
            </div>
          </aside>

          {/* Right Section */}
          <section className="col-span-8 card p-8 rounded-2xl shadow-lg space-y-6">
            {/* Professional Bio */}
            <div>
              <h2 contentEditable={isEditing} className={`text-xl text-primary mb-3 ${editableClass}`}>
                Professional Bio
              </h2>
              <p contentEditable={isEditing} className={`text-gray-500 text-sm ${editableClass}`}>
                Dr. Eleanor Vance is a board-certified orthopedic surgeon specializing in sports medicine and minimally invasive joint surgery.
                She combines evidence-based medical care with an empathetic approach, ensuring patients fully understand their recovery process.
                Her clinic emphasizes preventive therapy, lifestyle correction, and personalized rehabilitation.
              </p>
            </div>

            {/* Clinic Details */}
            <div>
              <h2 contentEditable={isEditing} className={`text-xl text-primary mb-3 ${editableClass}`}>
                Clinic Details
              </h2>
              <ul className={`list-none text-gray-500 text-sm leading-relaxed ${editableClass}`}>
                <li><strong>Clinic:</strong> Dr. Eleanor Vance’s Orthopedic Care</li>
                <li><strong>Address:</strong> 22, Cunningham Road, Bangalore</li>
                <li><strong>Consultation Timings:</strong> Mon–Sat, 9:00 AM – 5:00 PM</li>
                <li><strong>Emergency Line:</strong> +91-9812345678</li>
              </ul>
            </div>

            {/* Services Offered */}
            <div>
              <h2 contentEditable={isEditing} className={`text-xl text-primary mb-3 ${editableClass}`}>
                Services Offered
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3 items-start p-3 hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="text-3xl text-primary">🦵</div>
                  <div>
                    <h3 contentEditable={isEditing} className={`font-semibold text-gray-900 ${editableClass}`}>
                      Arthroscopic Surgery
                    </h3>
                    <p contentEditable={isEditing} className={`text-sm text-gray-500 ${editableClass}`}>
                      Minimally invasive techniques for precise joint repair and faster recovery.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="text-3xl text-primary">🏃‍♂️</div>
                  <div>
                    <h3 contentEditable={isEditing} className={`font-semibold text-gray-900 ${editableClass}`}>
                      Sports Injury Care
                    </h3>
                    <p contentEditable={isEditing} className={`text-sm text-gray-500 ${editableClass}`}>
                      Full-spectrum rehabilitation programs for athletes and active individuals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Feedback */}
            <div>
              <h2 contentEditable={isEditing} className={`text-xl text-primary mb-3 ${editableClass}`}>
                Patient Feedback
              </h2>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm" contentEditable={isEditing}>
                  “Dr. Vance’s expertise helped me return to my sport within weeks. Truly professional and compassionate.” – A. Raj
                </div>
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm" contentEditable={isEditing}>
                  “I felt genuinely cared for. The rehabilitation plan was easy to follow and effective.” – S. Mehta
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
