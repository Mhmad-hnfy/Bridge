import Header from "../../_Componants/Header";
import Cors from "../../_Componants/Cors";

export const metadata = {
  title: "All Courses - Eng:Mohamed Hanafy",
  description: "Browse all mathematics courses by Eng:Mohamed Hanafy",
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-10">
        <Cors />
      </div>
    </div>
  );
}
