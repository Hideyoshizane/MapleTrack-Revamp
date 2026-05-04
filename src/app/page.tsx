import Image from 'next/image';
import Link from 'next/link';

import FasterIcon from '@assets/svg/chevrons-up.svg';
import LightBulbIcon from '@assets/svg/lightbulb.svg';
import UnifiedIcon from '@assets/svg/squares-unite.svg';
import LandingSection from '@components/landingSection/landingSection';
import LandingShowcase from '@components/landingShowcase/landingShowcase';

import styles from '../styles/root.module.scss';

import type { JSX } from 'react';

const LandingPage = (): JSX.Element => {
	return (
		<div className={styles.mainDiv}>
			<div className={styles.topBar}>
				<Image alt="MapleTrack Logo" height={128} priority src="/assets/logo/logo.webp" width={384} />

				<div className={styles.buttonDiv}>
					<Link className={styles.signInButton} href="/login">
						Sign In
					</Link>

					<Link className={styles.signUpButton} href="/signup">
						Sign Up
					</Link>
				</div>
			</div>
			<div className={styles.block}>
				<div className={styles.content}>
					<div className={styles.welcomeDiv}>
						<p className={styles.title}>Welcome!</p>
						<p className={styles.subTitle}>Your ultimate companion in Progression and Triumph</p>
						<p className={styles.info}>Crafted by a fellow Mapler for Maplers</p>
					</div>
				</div>

				<Image
					className={styles.backgroundImage}
					alt="First Background"
					fill
					priority
					quality={100}
					src="/assets/landing/background1.webp"
				/>
			</div>

			<LandingSection backgroundSrc="/assets/landing/background2.webp">
				<LandingShowcase
					descriptions={['Track all your characters data in one place']}
					imageSrc="/assets/landing/showcase1.webp"
					reverse
					title="Centralized Character Database"
				/>
			</LandingSection>

			<LandingSection backgroundSrc="/assets/landing/background3.webp">
				<LandingShowcase
					descriptions={[
						'● Daily Symbol tracker;',
						'● Symbol Max Level ETA tracker;',
						'● Link Skill description;',
						'● Legion Block description;',
					]}
					imageSrc="/assets/landing/showcase2.webp"
					title="Character Progression Tracker"
				/>
			</LandingSection>

			<LandingSection backgroundSrc="/assets/landing/background4.webp">
				<LandingShowcase
					descriptions={[
						'● Plan your Weekly Crystal income;',
						'● World income tracking;',
						'● Weekly character income;',
					]}
					imageSrc="/assets/landing/showcase3.webp"
					reverse
					title="Boss Planner"
				/>
			</LandingSection>

			<LandingSection backgroundSrc="/assets/landing/background5.webp">
				<LandingShowcase
					descriptions={[
						'● Monitor Weekly Bosses completions;',
						'● Visualize income progress;',
						'● Consolidated Dashboard: Centralize Multi-Character data in one screen;',
					]}
					imageSrc="/assets/landing/showcase4.webp"
					title="Boss Tracker"
				/>
			</LandingSection>

			<div className={styles.block}>
				<div className={styles.finalContent}>
					<div className={styles.finalDiv}>
						<Image
							className={styles.classImage}
							alt="Ice Lightning Class Image"
							height={825}
							src="/assets/landing/Ice_Lightning.webp"
							width={874}
						/>

						<div className={styles.ctaDiv}>
							<div>
								<p className={styles.ctaTitle}>Master Your Progress</p>
								<p className={styles.ctaTitle}>Optimize Your Grind</p>
							</div>
							<div>
								<p className={styles.ctaDescription}>Your New Journey</p>
								<p className={styles.ctaDescription}>Starts HERE</p>
							</div>

							<div className={styles.badgeDiv}>
								<div className={styles.badge}>
									<FasterIcon className={styles.badgeIcon} />
									<p>Faster</p>
								</div>

								<div className={styles.badge}>
									<LightBulbIcon className={styles.badgeIcon} />
									<p>Smarter</p>
								</div>

								<div className={styles.badge}>
									<UnifiedIcon className={styles.badgeIcon} />
									<p>Unified</p>
								</div>
							</div>

							<Link className={styles.signUpButton} href="/signup">
								Create account
							</Link>
						</div>
					</div>
				</div>

				<Image
					className={styles.backgroundImage}
					alt="Sixth Background"
					fill
					quality={100}
					src="/assets/landing/background6.webp"
				/>
			</div>
		</div>
	);
};

export default LandingPage;
