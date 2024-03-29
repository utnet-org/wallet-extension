import React, { useState } from 'react';

const ConnectToMobileWalletDialog = ({ _onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleBack = () => {
    // 后退操作，跳转到上一页
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleForward = () => {
    // 前进操作，跳转到下一页
    setCurrentPage((prevPage) => Math.max(prevPage + 1, 1));
  };

  const handleClose = () => {
    _onClose();
  }

  const handleDialogClick = (event) => {
    // 阻止事件冒泡，防止链接的点击事件触发
    event.preventDefault();
    event.stopPropagation();
  };

  return (
      <div className="dialog" onClick={(event) => handleDialogClick(event)}>
        <div className="dialog-header">
          <button onClick={handleBack} disabled={currentPage === 1}>
            Back
          </button>
          <button onClick={handleForward} disabled={currentPage === 4}>
            Forward
          </button>
          <button onClick={handleClose}>Close</button>
        </div>
        <div className="dialog-body">
          {/* 根据当前页面渲染不同的内容 */}
          {currentPage === 1 && <Page1 />}
          {currentPage === 2 && <Page2 />}
          {currentPage === 3 && <Page3 />}
          {currentPage === 4 && <Page4 />}
        </div>
      </div>
  );
};

// 页面组件示例
const Page1 = () => <div>Page 1 Content</div>;
const Page2 = () => <div>Page 2 Content</div>;
const Page3 = () => <div>Page 3 Content</div>;
const Page4 = () => <div>Page 4 Content</div>;

export default ConnectToMobileWalletDialog;