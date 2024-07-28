import Image from 'next/image';

export default function Footer() {
    return (
        <div id="footer" className="clearfix">
            <div className="wrapper">
                <div className="master-plate">
                    <p>
                        <Image
                            src="/master-logo-small.gif"
                            width={112}
                            height={50}
                            alt="BU Logo"
                        />
                    </p>
                </div>
            </div>
        </div>
    );
}