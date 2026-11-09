export interface DistrictInfo {
  name: string;
  division: string;
  upazilas: string[];
}

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // Khulna Division (Focus region: Kushtia, Halsha)
  {
    name: 'Kushtia',
    division: 'Khulna',
    upazilas: ['Mirpur (Halsha)', 'Kushtia Sadar', 'Kumarkhali', 'Bheramara', 'Daulatpur', 'Khoksa']
  },
  {
    name: 'Meherpur',
    division: 'Khulna',
    upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar']
  },
  {
    name: 'Chuadanga',
    division: 'Khulna',
    upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar']
  },
  {
    name: 'Jhenaidah',
    division: 'Khulna',
    upazilas: ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa']
  },
  {
    name: 'Khulna',
    division: 'Khulna',
    upazilas: ['Khulna Sadar', 'Koyra', 'Dumuria', 'Paikgachha', 'Phultala', 'Batiaghata', 'Dacope', 'Dighalia', 'Rupsha', 'Terokhada']
  },
  {
    name: 'Bagerhat',
    division: 'Khulna',
    upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola']
  },
  {
    name: 'Satkhira',
    division: 'Khulna',
    upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala']
  },
  {
    name: 'Jashore',
    division: 'Khulna',
    upazilas: ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha']
  },
  {
    name: 'Magura',
    division: 'Khulna',
    upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur']
  },
  {
    name: 'Narail',
    division: 'Khulna',
    upazilas: ['Narail Sadar', 'Kalia', 'Lohagara']
  },

  // Dhaka Division
  {
    name: 'Dhaka',
    division: 'Dhaka',
    upazilas: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar', 'Dhaka City (Dhanmondi/Mirpur/Uttara/Gulshan/Badda)']
  },
  {
    name: 'Gazipur',
    division: 'Dhaka',
    upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi']
  },
  {
    name: 'Narayanganj',
    division: 'Dhaka',
    upazilas: ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon']
  },
  {
    name: 'Faridpur',
    division: 'Dhaka',
    upazilas: ['Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha']
  },
  {
    name: 'Rajbari',
    division: 'Dhaka',
    upazilas: ['Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali']
  },
  {
    name: 'Gopalganj',
    division: 'Dhaka',
    upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara']
  },
  {
    name: 'Madaripur',
    division: 'Dhaka',
    upazilas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar', 'Dasar']
  },
  {
    name: 'Shariatpur',
    division: 'Dhaka',
    upazilas: ['Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zajira']
  },
  {
    name: 'Manikganj',
    division: 'Dhaka',
    upazilas: ['Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Saturia', 'Shibalaya', 'Singair']
  },
  {
    name: 'Munshiganj',
    division: 'Dhaka',
    upazilas: ['Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Sirajdikhan', 'Sreenagar', 'Tongibari']
  },
  {
    name: 'Narsingdi',
    division: 'Dhaka',
    upazilas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur']
  },
  {
    name: 'Tangail',
    division: 'Dhaka',
    upazilas: ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari']
  },
  {
    name: 'Kishoreganj',
    division: 'Dhaka',
    upazilas: ['Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail']
  },

  // Rajshahi Division
  {
    name: 'Rajshahi',
    division: 'Rajshahi',
    upazilas: ['Rajshahi Sadar / City', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore']
  },
  {
    name: 'Pabna',
    division: 'Rajshahi',
    upazilas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar']
  },
  {
    name: 'Natore',
    division: 'Rajshahi',
    upazilas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga']
  },
  {
    name: 'Bogura',
    division: 'Rajshahi',
    upazilas: ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Sahajanpur', 'Sherpur', 'Shibganj', 'Sonatala']
  },
  {
    name: 'Sirajganj',
    division: 'Rajshahi',
    upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara']
  },
  {
    name: 'Naogaon',
    division: 'Rajshahi',
    upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar']
  },
  {
    name: 'Chapai Nawabganj',
    division: 'Rajshahi',
    upazilas: ['Chapai Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj']
  },
  {
    name: 'Joypurhat',
    division: 'Rajshahi',
    upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi']
  },

  // Chattogram Division
  {
    name: 'Chattogram',
    division: 'Chattogram',
    upazilas: ['Chattogram City', 'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda']
  },
  {
    name: 'Cox\'s Bazar',
    division: 'Chattogram',
    upazilas: ['Cox\'s Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Pekua', 'Eidgaon']
  },
  {
    name: 'Cumilla',
    division: 'Chattogram',
    upazilas: ['Cumilla Adarsha Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Muradnagar', 'Nangalkot', 'Titas', 'Meghna', 'Monohargonj', 'Sadarsouth', 'Lalmai']
  },
  {
    name: 'Brahmanbaria',
    division: 'Chattogram',
    upazilas: ['Brahmanbaria Sadar', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail']
  },
  {
    name: 'Chandpur',
    division: 'Chattogram',
    upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab North', 'Matlab South', 'Shahrasti']
  },
  {
    name: 'Noakhali',
    division: 'Chattogram',
    upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat']
  },
  {
    name: 'Feni',
    division: 'Chattogram',
    upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Fulgazi', 'Sonagazi']
  },
  {
    name: 'Lakshmipur',
    division: 'Chattogram',
    upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar']
  },
  {
    name: 'Rangamati',
    division: 'Chattogram',
    upazilas: ['Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali']
  },
  {
    name: 'Khagrachhari',
    division: 'Chattogram',
    upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara']
  },
  {
    name: 'Bandarban',
    division: 'Chattogram',
    upazilas: ['Bandarban Sadar', 'Ali Kadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi']
  },

  // Sylhet Division
  {
    name: 'Sylhet',
    division: 'Sylhet',
    upazilas: ['Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj', 'Dakshin Surma', 'Osmani Nagar']
  },
  {
    name: 'Moulvibazar',
    division: 'Sylhet',
    upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal']
  },
  {
    name: 'Habiganj',
    division: 'Sylhet',
    upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj']
  },
  {
    name: 'Sunamganj',
    division: 'Sylhet',
    upazilas: ['Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Shantiganj', 'Tahirpur', 'Madhyanagar']
  },

  // Barishal Division
  {
    name: 'Barishal',
    division: 'Barishal',
    upazilas: ['Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur']
  },
  {
    name: 'Bhola',
    division: 'Barishal',
    upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin']
  },
  {
    name: 'Patuakhali',
    division: 'Barishal',
    upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali']
  },
  {
    name: 'Pirojpur',
    division: 'Barishal',
    upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Indurkani']
  },
  {
    name: 'Barguna',
    division: 'Barishal',
    upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali']
  },
  {
    name: 'Jhalokati',
    division: 'Barishal',
    upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur']
  },

  // Rangpur Division
  {
    name: 'Rangpur',
    division: 'Rangpur',
    upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj']
  },
  {
    name: 'Dinajpur',
    division: 'Rangpur',
    upazilas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur']
  },
  {
    name: 'Kurigram',
    division: 'Rangpur',
    upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur']
  },
  {
    name: 'Gaibandha',
    division: 'Rangpur',
    upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj']
  },
  {
    name: 'Nilphamari',
    division: 'Rangpur',
    upazilas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur']
  },
  {
    name: 'Lalmonirhat',
    division: 'Rangpur',
    upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram']
  },
  {
    name: 'Panchagarh',
    division: 'Rangpur',
    upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia']
  },
  {
    name: 'Thakurgaon',
    division: 'Rangpur',
    upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail']
  },

  // Mymensingh Division
  {
    name: 'Mymensingh',
    division: 'Mymensingh',
    upazilas: ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gafargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Tara Khanda']
  },
  {
    name: 'Jamalpur',
    division: 'Mymensingh',
    upazilas: ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari']
  },
  {
    name: 'Netrokona',
    division: 'Mymensingh',
    upazilas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala']
  },
  {
    name: 'Sherpur',
    division: 'Mymensingh',
    upazilas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi']
  }
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const getUpazilasForDistrict = (districtName: string): string[] => {
  const match = BANGLADESH_DISTRICTS.find(d => d.name.toLowerCase() === districtName.toLowerCase());
  return match ? match.upazilas : [];
};
