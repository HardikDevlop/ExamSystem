/**
 * Simple layout wrapper for consistent navbar + content
 * Used optionally by pages that need the same nav pattern
 */
import React from 'react';

export default function Layout({ children, title }) {
  return (
    <>
      {title && <h1 className="page-title">{title}</h1>}
      {children}
    </>
  );
}
