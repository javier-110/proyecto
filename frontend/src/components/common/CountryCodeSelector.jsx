import React, { useState, useRef, useEffect } from 'react';
import { LATAM_PREFIXES, getFlagUrl } from '../../utils/phonePrefixes';

const CountryCodeSelector = ({ selectedPrefix, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = LATAM_PREFIXES.find(p => p.code === selectedPrefix) || LATAM_PREFIXES[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '90px',
                    padding: '8px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'white',
                    marginBottom: '10px'
                }}
            >
                <img
                    src={getFlagUrl(selectedOption.iso)}
                    alt={selectedOption.iso}
                    style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                />
                <span>{selectedOption.code}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px' }}>▼</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '140px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    zIndex: 1000,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                    {LATAM_PREFIXES.map(p => (
                        <div
                            key={p.code}
                            onClick={() => {
                                onSelect(p.code);
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'background 0.2s',
                                borderBottom: '1px solid #333'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <img
                                src={getFlagUrl(p.iso)}
                                alt={p.iso}
                                style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                            />
                            <span>{p.code}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CountryCodeSelector;
