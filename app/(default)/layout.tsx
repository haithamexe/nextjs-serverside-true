import React from "react";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
