'use client'
import React, { useState } from 'react';

export default function ExpandableKeyValue({ label, value }) {
  const [expanded, setExpanded] = useState(false);
  const strValue = String(value);

  const shouldTruncate = strValue.length > 40;
  const displayValue = expanded || !shouldTruncate
    ? strValue
    : strValue.slice(0, 40) + '...';

  return (
    <div className="flex items-start gap-2">
      <span className="font-semibold text-gray-700">{label}:</span>
      <span
        className="font-mono text-gray-800 cursor-pointer break-all"
        onClick={() => shouldTruncate && setExpanded(!expanded)}
        title={shouldTruncate ? (expanded ? 'Click to collapse' : 'Click to expand') : ''}
      >
        {displayValue}
      </span>
    </div>
  );
}
