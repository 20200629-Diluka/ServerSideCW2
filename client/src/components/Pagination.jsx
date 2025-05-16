import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Get range of page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const halfMax = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(currentPage - halfMax, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <BsPagination className="justify-content-center mt-4">
      <BsPagination.First 
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      />
      <BsPagination.Prev 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      
      {currentPage > 3 && totalPages > 5 && (
        <>
          <BsPagination.Item onClick={() => onPageChange(1)}>1</BsPagination.Item>
          {currentPage > 4 && <BsPagination.Ellipsis disabled />}
        </>
      )}
      
      {pageNumbers.map(number => (
        <BsPagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => onPageChange(number)}
        >
          {number}
        </BsPagination.Item>
      ))}
      
      {currentPage < totalPages - 2 && totalPages > 5 && (
        <>
          {currentPage < totalPages - 3 && <BsPagination.Ellipsis disabled />}
          <BsPagination.Item onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </BsPagination.Item>
        </>
      )}
      
      <BsPagination.Next
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <BsPagination.Last
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </BsPagination>
  );
};

export default Pagination; 