import AlumniHighlights from "./AlumniHighlights";
import BannerHero from "./BannerHero";
import EventSchedule from "./EventSchedule";
import GalleryPreview from "./GalleryPreview";
import RegistrationCTA from "./RegistrationCTA";
import ReunionHighlights from "./ReunionHighlights";
import ReunionInformation from "./ReunionInformation";
import ReunionIntro from "./ReunionIntro";
import ReunionStats from "./ReunionStats";
import SchoolJourney from "./SchoolJourney";
import SponsorsPreview from "./SponsorsPreview";

const Home = () => {
  return (
    <div>
      <BannerHero></BannerHero>
      <ReunionIntro></ReunionIntro>
      <SchoolJourney></SchoolJourney>
      <ReunionHighlights></ReunionHighlights>
      <ReunionStats></ReunionStats>
      <ReunionInformation></ReunionInformation>
      <EventSchedule></EventSchedule>
      <AlumniHighlights></AlumniHighlights>
      <GalleryPreview></GalleryPreview>
      <SponsorsPreview></SponsorsPreview>
      <RegistrationCTA></RegistrationCTA>
    </div>
  );
};

export default Home;
