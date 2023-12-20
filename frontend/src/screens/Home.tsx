import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Hero, HeroBackground, HeroBody, HeroCategory, HeroTitle, HeroButton } from 'design-react-kit';

const Home = () => {
    return <Hero overlay='primary'>
        <HeroBackground
            src='https://animals.sandiegozoo.org/sites/default/files/2016-08/animals_hero_mountains.jpg'
            title='image title'
            alt='imagealt'
        />
        <HeroBody>
            <HeroCategory>Category</HeroCategory>
            <HeroTitle>Heading lorem ipsum dolor sit amet, consetetur sadipscing.</HeroTitle>
            <p className='d-none d-lg-block'>
                Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Dictum sit amet justo
                donec enim diam vulputate ut. Eu nisl nunc mi ipsum faucibus.
            </p>
            <HeroButton outline color='primary'>
                Label button
            </HeroButton>
        </HeroBody>
    </Hero>;
};

export default Home;