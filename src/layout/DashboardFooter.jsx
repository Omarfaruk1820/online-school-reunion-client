const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-base-300 bg-base-100">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-7xl
          flex-col
          items-center
          justify-center
          gap-2
          px-4
          py-5
          text-center
          text-xs
          text-base-content/60
          sm:px-6
          sm:py-6
          sm:text-sm
          lg:flex-row
          lg:justify-between
          lg:text-left
          lg:px-8
        "
      >
        <p className="max-w-full break-words">
          © {currentYear} School Reunion. All rights reserved.
        </p>

        <p className="max-w-full break-words">
          Built for our school community.
        </p>
      </div>
    </footer>
  );
};

export default DashboardFooter;
