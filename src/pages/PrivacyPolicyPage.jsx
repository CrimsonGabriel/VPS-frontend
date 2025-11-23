// 💾 src/pages/PrivacyPolicyPage.jsx

import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  UnorderedList, 
  ListItem, 
  Link, 
  Divider, 
  VStack 
} from '@chakra-ui/react';

const PrivacyPolicyPage = () => {
    return (
        <Box bg="gray.900" minH="100vh" py={10} px={4}>
            <Container maxW="5xl">
                <Box 
                    bg="gray.800" 
                    p={{ base: 6, md: 10 }} 
                    borderRadius="xl" 
                    shadow="2xl" 
                    border="1px solid" 
                    borderColor="gray.700"
                    color="gray.300"
                >
                    {/* --- HEADER --- */}
                    <VStack spacing={4} mb={10} textAlign="center">
                        <Heading as="h1" size="2xl" color="blue.300">
                            Privacy Policy
                        </Heading>
                        <Text fontSize="md" color="gray.500" fontStyle="italic">
                            Last updated: November 18, 2025
                        </Text>
                    </VStack>

                    <Divider borderColor="gray.600" mb={8} />

                    {/* --- INTRODUCTION --- */}
                    <VStack align="stretch" spacing={4} mb={8}>
                        <Text lineHeight="tall" textAlign="justify">
                            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                        </Text>
                        <Text lineHeight="tall" textAlign="justify">
                            We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the <Link href="https://www.termsfeed.com/privacy-policy-generator/" target="_blank" rel="noopener noreferrer" color="blue.400">Privacy Policy Generator</Link>.
                        </Text>
                    </VStack>

                    {/* --- INTERPRETATION AND DEFINITIONS --- */}
                    <Box mb={8}>
                        <Heading as="h2" size="xl" mb={6} color="gray.100">Interpretation and Definitions</Heading>
                        
                        <Heading as="h3" size="lg" mb={4} color="blue.200">Interpretation</Heading>
                        <Text mb={4} lineHeight="tall">
                            The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                        </Text>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Definitions</Heading>
                        <Text mb={4}>For the purposes of this Privacy Policy:</Text>
                        <UnorderedList spacing={3} pl={4}>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Account</Text> means a unique account created for You to access our Service or parts of our Service.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Affiliate</Text> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Application</Text> refers to Testaplikacji, the software program provided by the Company.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Company</Text> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Testaplikacji.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Country</Text> refers to: Poland
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Device</Text> means any device that can access the Service such as a computer, a cell phone or a digital tablet.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Personal Data</Text> is any information that relates to an identified or identifiable individual.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Service</Text> refers to the Application.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Service Provider</Text> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">Usage Data</Text> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">You</Text> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
                            </ListItem>
                        </UnorderedList>
                    </Box>

                    <Divider borderColor="gray.600" mb={8} />

                    {/* --- COLLECTING AND USING DATA --- */}
                    <Box mb={8}>
                        <Heading as="h2" size="xl" mb={6} color="gray.100">Collecting and Using Your Personal Data</Heading>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Types of Data Collected</Heading>
                        
                        <Heading as="h4" size="md" mb={3} color="white">Personal Data</Heading>
                        <Text mb={3} lineHeight="tall">
                            While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                        </Text>
                        <UnorderedList spacing={2} pl={4} mb={6}>
                            <ListItem>Email address</ListItem>
                            <ListItem>Usage Data</ListItem>
                        </UnorderedList>

                        <Heading as="h4" size="md" mb={3} color="white">Usage Data</Heading>
                        <VStack align="stretch" spacing={3} mb={6}>
                            <Text lineHeight="tall">Usage Data is collected automatically when using the Service.</Text>
                            <Text lineHeight="tall">
                                Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                            </Text>
                            <Text lineHeight="tall">
                                When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
                            </Text>
                            <Text lineHeight="tall">
                                We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.
                            </Text>
                        </VStack>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Use of Your Personal Data</Heading>
                        <Text mb={4}>The Company may use Personal Data for the following purposes:</Text>
                        <UnorderedList spacing={3} pl={4} mb={6}>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">To provide and maintain our Service</Text>, including to monitor the usage of our Service.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">To manage Your Account:</Text> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">For the performance of a contract:</Text> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">To contact You:</Text> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">To provide You</Text> with news, special offers, and general information about other goods, services and events which We offer that are similar to those that you have already purchased or inquired about unless You have opted not to receive such information.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">To manage Your requests:</Text> To attend and manage Your requests to Us.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">For business transfers:</Text> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.
                            </ListItem>
                            <ListItem>
                                <Text as="span" fontWeight="bold" color="white">For other purposes:</Text> We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.
                            </ListItem>
                        </UnorderedList>

                        <Text mb={4}>We may share Your personal information in the following situations:</Text>
                        <UnorderedList spacing={3} pl={4}>
                            <ListItem><Text as="span" fontWeight="bold" color="white">With Service Providers:</Text> We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.</ListItem>
                            <ListItem><Text as="span" fontWeight="bold" color="white">For business transfers:</Text> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</ListItem>
                            <ListItem><Text as="span" fontWeight="bold" color="white">With Affiliates:</Text> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</ListItem>
                            <ListItem><Text as="span" fontWeight="bold" color="white">With business partners:</Text> We may share Your information with Our business partners to offer You certain products, services or promotions.</ListItem>
                            <ListItem><Text as="span" fontWeight="bold" color="white">With other users:</Text> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</ListItem>
                            <ListItem><Text as="span" fontWeight="bold" color="white">With Your consent:</Text> We may disclose Your personal information for any other purpose with Your consent.</ListItem>
                        </UnorderedList>
                    </Box>

                    <Divider borderColor="gray.600" mb={8} />

                    {/* --- RETENTION, TRANSFER, DELETE --- */}
                    <Box mb={8}>
                        <Heading as="h3" size="lg" mb={4} color="blue.200">Retention of Your Personal Data</Heading>
                        <Text mb={4} lineHeight="tall">
                            The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                        </Text>
                        <Text mb={6} lineHeight="tall">
                            The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer periods.
                        </Text>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Transfer of Your Personal Data</Heading>
                        <VStack align="stretch" spacing={4} mb={6}>
                            <Text lineHeight="tall">
                                Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those from Your jurisdiction.
                            </Text>
                            <Text lineHeight="tall">
                                Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
                            </Text>
                            <Text lineHeight="tall">
                                The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.
                            </Text>
                        </VStack>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Delete Your Personal Data</Heading>
                        <VStack align="stretch" spacing={4} mb={6}>
                            <Text lineHeight="tall">
                                You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.
                            </Text>
                            <Text lineHeight="tall">
                                Our Service may give You the ability to delete certain information about You from within the Service.
                            </Text>
                            <Text lineHeight="tall">
                                You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.
                            </Text>
                            <Text lineHeight="tall">
                                Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.
                            </Text>
                        </VStack>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Disclosure of Your Personal Data</Heading>
                        
                        <Heading as="h4" size="md" mb={2} color="white">Business Transactions</Heading>
                        <Text mb={4} lineHeight="tall">
                            If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
                        </Text>

                        <Heading as="h4" size="md" mb={2} color="white">Law enforcement</Heading>
                        <Text mb={4} lineHeight="tall">
                            Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
                        </Text>

                        <Heading as="h4" size="md" mb={2} color="white">Other legal requirements</Heading>
                        <Text mb={3}>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</Text>
                        <UnorderedList spacing={2} pl={4} mb={6}>
                            <ListItem>Comply with a legal obligation</ListItem>
                            <ListItem>Protect and defend the rights or property of the Company</ListItem>
                            <ListItem>Prevent or investigate possible wrongdoing in connection with the Service</ListItem>
                            <ListItem>Protect the personal safety of Users of the Service or the public</ListItem>
                            <ListItem>Protect against legal liability</ListItem>
                        </UnorderedList>

                        <Heading as="h3" size="lg" mb={4} color="blue.200">Security of Your Personal Data</Heading>
                        <Text lineHeight="tall">
                            The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.
                        </Text>
                    </Box>

                    <Divider borderColor="gray.600" mb={8} />

                    {/* --- CHILDREN, LINKS, CHANGES --- */}
                    <Box mb={8}>
                        <Heading as="h2" size="xl" mb={6} color="gray.100">Children's Privacy</Heading>
                        <Text mb={4} lineHeight="tall">
                            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.
                        </Text>
                        <Text lineHeight="tall">
                            If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.
                        </Text>
                    </Box>

                    <Box mb={8}>
                        <Heading as="h2" size="xl" mb={6} color="gray.100">Links to Other Websites</Heading>
                        <Text mb={4} lineHeight="tall">
                            Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site you visit.
                        </Text>
                        <Text lineHeight="tall">
                            We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                        </Text>
                    </Box>

                    <Box mb={8}>
                        <Heading as="h2" size="xl" mb={6} color="gray.100">Changes to this Privacy Policy</Heading>
                        <Text mb={4} lineHeight="tall">
                            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
                        </Text>
                        <Text mb={4} lineHeight="tall">
                            We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
                        </Text>
                        <Text lineHeight="tall">
                            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                        </Text>
                    </Box>

                    <Divider borderColor="gray.600" mb={8} />

                    {/* --- CONTACT --- */}
                    <Box>
                        <Heading as="h2" size="xl" mb={6} color="gray.100">Contact Us</Heading>
                        <Text mb={4}>If you have any questions about this Privacy Policy, You can contact us:</Text>
                        <UnorderedList spacing={3} pl={4}>
                            <ListItem>
                                By visiting this page on our website: <Link href="https://testserwera.pl/" isExternal color="blue.400">https://testserwera.pl/</Link>
                            </ListItem>
                        </UnorderedList>
                    </Box>

                </Box>
            </Container>
        </Box>
    );
};

export default PrivacyPolicyPage;