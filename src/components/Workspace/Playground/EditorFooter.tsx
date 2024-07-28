import React from "react";

type EditorFooterProps = {
  handleSubmit: () => void;
};

const EditorFooter: React.FC<EditorFooterProps> = ({ handleSubmit }) => {
  return (
    <div className='flex bg-dark-layer-1 absolute bottom-0 z-10 w-full'>
      <div className='mx-5 my-[10px] flex justify-between w-full'>
        <button
          className='px-3 py-1.5 font-medium items-center transition-all focus:outline-none inline-flex text-sm text-white bg-dark-green-s hover:bg-green-3 rounded-lg'
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
export default EditorFooter;
