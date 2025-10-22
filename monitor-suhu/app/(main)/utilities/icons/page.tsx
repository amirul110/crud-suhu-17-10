'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';

// Define types
interface IconProperties {
    name: string;
}

interface IconData {
    icon?: {
        tags?: string[];
    };
    properties?: IconProperties;
}

interface IconServiceType {
    getIcons(): Promise<IconData[]>;
}

// Mock IconService jika file asli tidak ada
const IconService: IconServiceType = {
    async getIcons(): Promise<IconData[]> {
        // Fallback data jika file tidak ditemukan
        const fallbackIcons: IconData[] = [
            { properties: { name: 'check' }, icon: { tags: ['check', 'success'] } },
            { properties: { name: 'times' }, icon: { tags: ['times', 'close'] } },
            { properties: { name: 'spinner' }, icon: { tags: ['spinner', 'loading'] } },
            { properties: { name: 'user' }, icon: { tags: ['user', 'person'] } },
            { properties: { name: 'cog' }, icon: { tags: ['cog', 'settings'] } },
            { properties: { name: 'home' }, icon: { tags: ['home', 'house'] } },
            { properties: { name: 'search' }, icon: { tags: ['search', 'find'] } },
            { properties: { name: 'bell' }, icon: { tags: ['bell', 'notification'] } },
            { properties: { name: 'envelope' }, icon: { tags: ['envelope', 'email'] } },
            { properties: { name: 'heart' }, icon: { tags: ['heart', 'like'] } }
        ];
        return fallbackIcons;
    }
};

const IconsDemo = () => {
    const [icons, setIcons] = useState<IconData[]>([]);
    const [filteredIcons, setFilteredIcons] = useState<IconData[]>([]);

    useEffect(() => {
        IconService.getIcons().then((data: IconData[]) => {
            // Sort icons by name
            const sortedData = data.sort((icon1: IconData, icon2: IconData) => {
                const name1 = icon1.properties?.name || '';
                const name2 = icon2.properties?.name || '';
                
                if (name1 < name2) return -1;
                else if (name1 > name2) return 1;
                else return 0;
            });

            setIcons(sortedData);
            setFilteredIcons(sortedData);
        });
    }, []);

    const onFilter = (event: React.FormEvent<HTMLInputElement>) => {
        const searchValue = event.currentTarget.value.toLowerCase();
        
        if (!searchValue) {
            setFilteredIcons(icons);
        } else {
            const filtered = icons.filter((it: IconData) => {
                return it.icon?.tags?.some(tag => 
                    tag.toLowerCase().includes(searchValue)
                ) || it.properties?.name.toLowerCase().includes(searchValue);
            });
            setFilteredIcons(filtered);
        }
    };

    return (
        <div className="card">
            <h2>Icons</h2>
            <p>
                PrimeReact components internally use{' '}
                <Link href="https://github.com/primefaces/primeicons" className="font-medium hover:underline text-primary" target={'_blank'}>
                    PrimeIcons
                </Link>{' '}
                library, the official icons suite from{' '}
                <Link href="https://www.primetek.com.tr" className="font-medium hover:underline text-primary" target={'_blank'}>
                    PrimeTek
                </Link>
                .
            </p>
            
            <h4>Download</h4>
            <p>PrimeIcons is available at npm, run the following command to download it to your project.</p>
            <pre className="app-code">
                <code>{`npm install primeicons --save`}</code>
            </pre>
            
            <h4>Getting Started</h4>
            <p>
                PrimeIcons use the <strong>pi pi-&#123;icon&#125;</strong> syntax such as <strong>pi pi-check</strong>. 
                A standalone icon can be displayed using an element like <i>i</i> or <i>span</i>
            </p>
            <pre className="app-code">
                <code>
                    {`<i className="pi pi-check" style={{ marginRight: '.5rem' }}></i>
<i className="pi pi-times"></i>`}
                </code>
            </pre>
            
            <h4>Size</h4>
            <p>Size of the icons can easily be changed using font-size property.</p>
            <pre className="app-code">
                <code>{`<i className="pi pi-check"></i>`}</code>
            </pre>
            <i className="pi pi-check"></i>

            <pre className="app-code">
                <code>{`<i className="pi pi-check" style={{ fontSize: '2rem' }}></i>`}</code>
            </pre>
            <i className="pi pi-check" style={{ fontSize: '2rem' }}></i>
            
            <h4>Spinning Animation</h4>
            <p>Special pi-spin class applies continuous rotation to an icon.</p>
            <pre className="app-code">
                <code>{`<i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>`}</code>
            </pre>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            
            <h4>List of Icons</h4>
            <p>
                Here is the current list of PrimeIcons, more icons are added periodically. You may also{' '}
                <Link href="https://github.com/primefaces/primeicons/issues" className="font-medium hover:underline text-primary" target={'_blank'}>
                    request new icons
                </Link>{' '}
                at the issue tracker.
            </p>
            
            <div>
                <InputText 
                    type="text" 
                    className="w-full p-3 mt-3 mb-5" 
                    onChange={onFilter} 
                    placeholder="Search an icon" 
                />
            </div>
            
            <div className="grid icons-list text-center">
                {filteredIcons.map((iconMeta: IconData) => {
                    const { icon, properties } = iconMeta;

                    return (
                        icon?.tags?.indexOf('deprecate') === -1 && (
                            <div className="col-6 sm:col-4 lg:col-3 xl:col-2 pb-5" key={properties?.name}>
                                <i className={'text-2xl mb-2 pi pi-' + properties?.name}></i>
                                <div>pi-{properties?.name}</div>
                            </div>
                        )
                    );
                })}
            </div>
        </div>
    );
};

export default IconsDemo;