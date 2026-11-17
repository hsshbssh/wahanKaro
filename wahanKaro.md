sabse pehle hame authentication krni hoti hai toh ham
sabse pehle user model banayenge jisme woh fields likhenge joh hume hamare user mein chahiye aur inhe frontend se lenge
uske baad database connection krenge
after that register api banayenge aur uske andr apne user ko register krwayenge/create krwayenge

ab iske baad login ki baari aayegi uske liye saara kaam auth.ts mein hoga johki hamari lib mein milegi

ab iske baad home page banayenge

> > Nav ko responsive krne ke liye isOpen aur setIsOpen karna hoga aur mobile pe jaisa dikhega usko last mein likho aur classname mein md:hidden krdo
> > issi mein meine active path ko kaise highlight karte hai woh bhi seekha

fir humne login aur signup pages banaye unme dono mein uni respective api's fetch kri and data bheja taaki database mein data store hoske aur wha se data aa bhi ske aur ye kaam hamne src ke andr app ke andr login aur register folder bnake kiya hai

ab hum layout.tsx ko sessionprovider se wrap krdenge taaki ham apna useSession use krske
ab hum signup ke just baad email verification krayenge otp ke through ki manlo user ne koi bhi gmail daaldia toh woh kisi bhi demo ya fake gmail se login na ho isliye ham ye krrhe hai

iske liye seprate app ke andr verifyOtp krke folder banao aur usme saara hisaab kitab likho

ab meine verifyOtp ka ui bana liya hai ab hum dekhenge ki mail kaise bhejna hai aur uske liye jaake dekh lib ke andr sendMail krke file hai

mail wagera bhejne ke liye hame ke package install krna ho {node mailer}->npm i nodemailer
iske types bhi install krne honge npm i --save-dev @types/nodemailer

aur ye sendMail ki wajah se hame teen fields bhi add krni hogi user Model mein
isEmailVerified
otp
otpExpiresIn

ab register api mein aake iska bhi logic likho

uske baad iski bhi api banao verify-otp karke

hamne register API mein OTP generate karke save kiya, aur verify-otp API mein OTP check karke verify kiya. Dono alag responsibilities hain.

Register API ka kaam:
User signup karta hai
↓
OTP generate karo
↓
OTP database mein save karo
↓
OTP email par bhejo
Verify OTP API ka kaam:
User email se OTP enter karta hai
↓
Email + entered OTP backend ko bhejo
↓
Database se user find karo
↓
Database wale OTP se entered OTP compare karo
↓
Correct hai?
↓
Email verified = true

fir last mein verify otp ke page pe jaake simply iss verify-otp ko fetch krlo

and flow ye rhega login pe click krte hi login khulega and uske baad signup pe jaaoge naya user create krne ke liye fir saari details daalne ke baad send Otp pe click kroge aur fir ham verify-otp ke route pe phochenge aur fir ham otp ko verify krne ke baad wapis login pe phochenge jha pe saari details daalne ke baad user finally login hoga

ab ham apne project ke andr redux toolkit implement krenge joh ki ham use krte hai state management ke liye matlab hum apne data ko kisi bhi page pe use krskte hai
install krne ke liye ye command lagegi npm i @reduxjs/toolkit

uske baad react ke saath redux ko use krne ke liye ye cmd lgegi npm i react-redux

basically iske andr ek store hota hai jisme ham different types ke data boxes rkte hai aur inn data boxes ko redux toolkit mein kehte hai slices
maanlo ek hamne banai user slice toh usme ham saara user ka data rkhenge similarly agr humne banai vehicle slice toh usme saara vehicle ka data rakhenge

ab agr hame user ka koi data chahiye toh ham store mein jaake user slice mein se data lelenge

ab store hai toh data sirf lenge hi nahi balki denge bhi
toh uske liye ham store mein jaayenge user slice ko open krenge and uske andr data daaldenge

ab store.ts mein meine slices banai hai aur unn slices ko yaha import kiya hai basically baanaya seprate files mein h redux folder ke andr hi jaise userSlice.ts mein user slice banayi hai

ab iss store ko poore app ko provide bhi krana hoga toh uske liye layout mein jaake children ko provider se wrap krana hoga aur isme bhi wahi issue hai joh hamare seesion ke saath tha toh iske liye bhi seprate provider banana hoga

ab chrome mein hamare paas ek extension bhi hota hai joh ki hota hai redux dev tools ke naam se toh isme ham dekh skte h ki hamare project mein hamne kitni slices use ki hai

ab hume userData laane ke liye ek api banani hogi aur ham uss api ko tab call krenge jab hamara session ke andr status authenticated hojaaega
iske liye ham api ke andr user naam se folder banayenge aur uske andr ham saari user related api's likhenge aur uss user ke andr hi ek "me" {me mtlb user apne ko find krrha hai} naam se folder bhi hoga aur fir uske andr route.ts hogi

ab iss api ko call krne ke liye ham custom hooks banayenge src ke andr hooks naam se folder bnake uske andr UseGetMe naam ka hook banayenge

ab iss hook ko hame page khulte hi yaani website load hote hi call krana hai toh hume isko use krna hoga layout.tsx mein kyunki wohi sbse pehle render hoti hai and uske liye bhi hum ek InitUser.ts naam ki file banayenge src ke andr jisme ham isko tab call kraenge jab session mein status authenticated hoga

ab ye hogya hamara data store krane ka kaam ab ham dekhna hai ki page lode hote hi login button dikega yaa userProfile aur ye ham check krenge userData se agr userData hua toh profile dikhegi aur agr nhi hua toh login button dikhega

aur pehle hame userData get krna pdega store se aur ab usse seekhte hai ki kaise krte hai

ab userData ko toh get krke uska logic bhi likh liya nav mein aur ye kaam useselector hook ki wajah se hua hai

iske baad ham apne nav ko enhance krne lage jaise ki userData hai toh ham profile dikhaye naaki login button dikhe aur logout ko bhi implement kiya

logout ka flow aisa hoga
NextAuth session clear karna → ye signOut() function se hota hai jo NextAuth provide karta hai.
Redux store ka userData empty karna → taaki tumhare UI mein userData null ho jaaye.

ab iske baad thoda nav bar wagera responsive kiya meine aur login aur sign up funtionalities bhi enhance krdi hai

ab chlte hai vehicleSlider banane ke liye dekh compnents mein aur saath hi mein meine footer bhi banaya hai aur dono hi mostly vibecoded hai aur sath hi mein meine isme slider functionality seekhi hai vehicleSlider mein

ab ham middleware banayenge proxy.ts krke jisme ham dekhenge ki agr hamara role user hai toh ham sirf user ke route access krpaaye agr hamara role admin hai toh sirf admin ke route aur agr partner hai toh sirf partner ke route access krpaye

aur ek aur cheez krwayenge jaise ki agr user authenticated nhi hai toh bas woh authentication ke routes aur api acces kr paaye naaki koi aur route

iske liye src ke andr proxy.ts banado

ab mera middleware banke ready hai aur ab mein nav mein joh become a partner banaya tha ab mein uspe click krke partner ke onboarding details krwaunga jisme ham vehicle ki details dalwayenge apni documents fill krenge apni bank details daalenge aur fir apne user role ko partner role mein convert krdenge

uske liye src ke andr app ke andr partner folder banao aur fir usme onboarding folder banao aur fir usme vehicle folder banake uske andr page.tsx likh de aur jaise hi become a partner pe click ho toh woh issi url pe aaeega

ab ham onboarding mein details dalwayenge toh hume vehicle ka model bhi toh banana hoga taaki uski details backend mein stored rahe

toh model banayenge vehicle.model.ts ke naam se jisme hamne almost saari vehicle details prices wagera store karaliye hai
ab hum ek aur model banayenge jisme partner ke documents wagera store honge partnerDocs.model.ts naam ki file banayenge

uske baad ek aur model banayenge jisme ham partner ki bank details store karayege partnerBank.model.ts naam se

itna krte hi ham ab seedhe jump krenge become a partner ke pages ka ui banane
jisme humne vehicle documents aur bank ke ui pages banaye

ab hum krenge cloudinary ko setup
sabse pehle install krna hoga npm i cloudinary
ab lib ke andr jaake cloudinary ka setup kro cloudinary.ts ke andr

Now hamara cloudinary setup hogya hai and ab hum apni partner ki api's design krskte hai

aur api folder mein jaake partner folder k andr api likho sabki seperate

vehicle ki api banate hue ek cheez aur kri meine
ki user model mein jaake ek partnerOnBoardingSteps ko bhi banaya jh ki number typ ka hoga jiski minimum value hogi 0 aur max hogi 8 {mtlb initially koi step complete nhi hoga toh 00 aur final hoga 8th step}

The 8 steps are as follows:-

vehicle details
document details
bank details
in review{ mtlb ye details admin pe jaayengi review ke liye}
video kyc
pricing wagera daalenge
final review
in last live hojaaenge hum

ab humne vehicle ki api banali hai and now hum ab documents ki api banayenge

ab hum bank ki banayenge aur bank ki bnate hue hume mobile field ko model mein banane ki jaroorat padi jise hum user model mein banayenge

ab teeno ki api design hogyi hai ab hume inn teeno ko fetch krna hai joh ki hum inn teeno ki seperate files mein krenge

documents upload krane ke liye sabse pehle docs,setDocs naam ka useState bana liya
fir har ek div ke andr unka seprate input field banaya joh ki image aur pdf ko accept krega aur ye initially hidden rahega aur ye khulega jab hum uss particular div ke upload pe click krenge

iske baad hum ek function banayenge joh ki onchange pe chlega har input ke joh ki image ko isme dalwayega

ab hamne docs ke andr images ko store krwaliya hai bas ab hume api ko fetch krke formdata ke through backend mein data bhejna hai ye

ab hum bank docs ko fetch krenge

ab humne onboarding steps complete krliye hai partner ke

ab hum zegoCloud ko setup krenge jisi help se hum video kyc krenge as ye real time chat video call audio call in sab ke liye sdk's deta hai

zego ke configurations likh rha hu yaha pe aur iske aage next public likhne se ye frontend mein accessible hojaaenge automatically {env ke andr}

ab app ke andr ek folder banayenge zego krke jisme ham video kyc ki saari cheeze krenge
ab iske andr page.tsx banao aur fir pehle npm i npm install @zegocloud/zego-uikit-prebuilt

isse poora ready ui mil jaaega hume

abhi pehle hume partnerDahboard banana hoga usse pehele ham page.tsx johki main wala hai layout.jsx ke neeche uske andr condition lagani hogi ki agr user ka role admin hai toh admin dashboard dikhao agr partner hai toh partner dashboard aur agr user hai toh public home dikhao

jaake dekh page.tsx mein

ab mein partnerDashboard design krrha hu jisme meine progress bar banana seekha hai
aur meine completed / active step pe click krne pe unke respective routes pr bhi partner ko redirect kiya hai
ab mein chahta hu ki agr mein vehicle pe jaau toh uss partner ka vehicle data already filled mile agr exist krta hai toh
toh ye kaam krunga mein vehicle.tsx mein ek useeffect ke andr function design krke jaake dekh

ab ye krne ke baad ham docs ke andr files agr upload hogyi hai toh uploaded dikhna chahiye but ham isme koi get api call nhi krrrhe hai balki jaise hi user upload kre toh upload aur cloud icon ki jagah uploaded likha mil jaaye toh ab usse jaake krte hai docs ke andr

ab chlke bank ki get api ko fetch krdo
ab isme mujhe mobile field ko bhi access krna hai kyunki usse bhi th get krna hai toh woh ham bankDocs se nhi krenge usse hame user.mobileNumber krna hoga kyunki user meein mobile number store kiya tha aur response return krte time api se hame partnerDocs ke saath alg se mobile number bhejna hoga joh ki user se aane waala hai

ab hum chlke apna admin dashboard design krenge
usse pehle admin ke dashboard ki api's bhi design krni pdegi jisme ham check krenge ki role admin hai ya nhi aur saath hi mein kitne partners hai kitne approved hai kitne pending hai kitne rejected hai but iske liye hame user model mein jaake partnerStatus krke ek aur field add krni hogi jisse hum api mein fetch krenge dekh jaake admin api mein

ab api design krli hai ab chlke admin dashboard mein isse fetch krlenge

admin dashboard ka ui acche se dekh kaafi complex hai
ab issi mein meine seekha kaafi kuch ki show kaise krana hai frontend pe admin data ko aur ab pending partner reviews pe kisi bhi partner ke review pe click krne pr kaise review pr jaayenge woh dekhna hai {dynamic routes ki help leni hogi jaake dekh app ke andr admin folder}

ab flow samajh
admin mein kisi pending partner ke review pe click krega toh ham ussi partner ke review page pe kaise aayenge?

toh sabse pehle hame api banani hogi isme /api/admin/review/partner/[id] aur iske andr ham id ke basis pe data fetch krenge
isme params ke through id laayenge aur wahi normal session check hoga for unauthoriised access detection ke liye

but one important note ki joh ye params se id aayegi woh initially ek promise hogi johki resolve krke ham partnerId mein store krayenge
fir ham check krenge user model mein ki iss id ka user exist krta hai ya nhi
fir ham iss id ko owner mein paas krake sabhi bank vehicle aur document ki details nikaal lenge thats it aur response return krdenge

ab jaake dekh iss API mein

iske baad meine partner dets nav banaya aur ab mein approve aur reject vendor ka logic bhi likh raha hu jisme ek aur api banani hogi patch wali jisse database mein status change ho pending se approved hojaaye ya reject hojaaye

jaake dekh [id] iske route.ts mein

ab iske andr sabke status update kiye gye hai partner vehicle ka approved kiya partnerbank docs ka verified kiya aur partner docs ka approved kiya aur lastly apne partner ko bhi approved krdiya

Ab exact flow check kar
New partner
Vehicle save
steps = 1
status = pending

Documents save
steps = 2
status = pending

Bank save
steps = 3
status = pending

Dashboard
↓
Review
Admin APPROVE
partnerStatus = approved
partnerOnBoardingSteps = 4

Vehicle = approved
Documents = approved
Bank = verified

Dashboard
↓
Video KYC
Approved partner vehicle edit kare
partnerStatus = pending
partnerOnBoardingSteps = 3

Vehicle = pending

Dashboard
↓
Review
Approved partner documents edit kare
partnerStatus = pending
partnerOnBoardingSteps = 3

Documents = pending

Dashboard
↓
Review
Approved partner bank edit kare
partnerStatus = pending
partnerOnBoardingSteps = 3

Bank = added

Dashboard
↓
Review
Admin dobara APPROVE kare
partnerStatus = approved
partnerOnBoardingSteps = 4

Vehicle = approved
Documents = approved
Bank = verified

Dashboard

itna krne ke baad humne apne status card banaye joh ki partner dashboard mein show honge ki agr status pending aur on boarding steps 3 hai toh ye dikhao wrna doosre cards jaake dekhle ussi mein

ab humne review tak ke steps complete krliye hai ab hum complete krenge video kyc functionality
iske liye sabe pehle user model ke andr 3 fields aur add krni hogi jaake dekh

ab video kyc ke liye kuch aisa scene hoga ki status initially toh sabke liye notrequired hoga yani normal user ke liye notreq uske baad jab koi user partner banna chahega toh jab woh 4 step yani document verify jaise hi kralege toh hum uske viddeo kyc ke status ko pending krdenge aur fir jaise hi admin video kyc ke start button pe click krega waise hi ham partner ke video kyc status ko in_progress krdenge aur fir admin pe depend krega ki aage video kyc ka status rejected hoga ya pending

ab jaake jaha hum apne partnerstatus ko approved kra rhe the wahi jaake video kyc ka status pending krdenge

ab admin jaise hi approve krega yani documents verify krega toh waise hi admin dashboard mein pending video kyc update hojaani chahiye aur usme start kyc hona chahiye toh ab hum isse aise krenge

iske liye video kyc api banayenge api mein admin ke andr

sabse pehle humne video kyc mein pending aur inprogress wali kyc ko get krne ki api banai aur usse admin dashboard mein fetch bhi krliya but jab pending video kyc pe click krrha hu toh abhi bhi review ka button aarha hai naaki start kyc ka toh usse sahi kr jaake content show mein

ab ye bhi krdiya hai now ab mein chahta hu ki start kyc pe click krne pr status ko in progress krdu uske liye ek videoKyc ke andr hi start api banani hogi joh do kaam karegi start kyc pe click hote hi video kyc ka status in_progress krdegi aur room id generate karde aur ye hote hi start kyc ki jagah join call aane lagega aur join call pe click krenge toh ye hume hamare zego wale page pe le jaayega joh humne pehle banaya tha
jaake dekh start api mein

iss api ko hum fetch krenge content show ke andr kyunki ham ussi ke andr content dikha rhe hai so jaake dekh

ab humne fetch krke status update krdiya hai aur userdata ke andr room id bhi aa hi gayi hai and now hume partner dashboard mein video kyc ke liye bhi div banani hogi ki jab hamara on boarding step 5 hai aur video kyc status approved/rejected hai toh kya show krna hai aur jab in progress hai toh ek start call ka option bhi dena hai jisse partner call join karega aur join call se apna admin call join krega

ab humne partner dashboard pe bhi start call ka option dediya hai ab hume woh page design krna hai jaha pe ye call hogi
aur ye page hone wala hai /videoKyc/${userData.videokycRoomId} kyunki start call ke click krne pe issi route pe jaarhe hai

joh hamara zego folder tha usko ham rename krke videoKyc krrhe hai aur fir uske andr [roomId] krke folder banayenge aur fir iske andr page.tsx rahega

ab hame apne start call joh ki partner dashboard mein hai usse /videoKyc/${userData.videokycRoomId} iss route pe leke jaana hoga aur hamara admin ke andr joh join call arha hai johki hame content show mein dikhega usse bhi issi room id pe leke aana hai admin ke route ke hisaab se

ab humne dono ko same route pe le aaya hai toh ham ab videoKyc ke andr [roomId] ke andr page.tsx ko design krenge badhiya sa

ab joh bhi ui ka kaam tha aur thodi functionality thi meine ai ki help se banadi hai ab bas mujhe admin ke case meein approve pe videokyc approve krni hai aur reject mein reject

toh iske liye hame api mein videoKyc ke andr ek complete folder banana hai aur fir uske andrr route.ts banana hai

isme ham frontend se roomId action(approve krrha h ya reject krrhe hai) aur rejction ke case mein rejection ka reason leke aayenge jaake dekh route.ts mein

ab jaake iss api ko fetch krle approve aur reject action ke liye seprately apne videoKyc ke page pe

ab ye loop hole tha code mein isse bhi shi kiya
Admin Video KYC reject karega → videoKycStatus = "rejected" + videoKycRejectionReason = reason
Partner dashboard pe rejection reason clearly dikhega.
Partner “Start Call Again” karega → backend me videoKycStatus = "in_progress" ho jayega.
Purana rejection reason clear ho jayega, taaki new KYC ke time old reason na dikhe.
partnerStatus ko change karne ki zarurat nahi hai — yahan videoKycStatus ko rejected → in_progress karna correct flow hai. Tumhare model me videoKycRejectionReason already hai.

isko krne ke liye ek nayi api bnani padi partner ke andr banaya hai abki videoKyc aur uske andr retry krke folder banaya {partner mein isliye abanya kyunki abki partner dashboard pe main kaam hai}

ab hamara finally video kyc complete hua

ab hume pricing box bnana hai jisme hume ek vehicle image deni hogi aur saath mein base fare

iske liye partnerDashboard mein usestate bana show pricing set show pricing krke aur go to step function ke andr condition daal de ki step agr 6 hai aur partner aur videoKycstatus approved ha toh set show pricing isse true krde taaki ye div dikhne lage

ab meine ui design krke functionality bhi poori krdi hai but abhi backend mein api banana hai joh ki meine partner ke andr pricing folder ke andr route.ts banai hai

ab iske andr mein saara data frontend se formData ke through le rha hu woh isliye kyunki image formData mein bhejni hi padegi toh baaki bhi issimein hi bhejdiye dekhle jaake

ab meine api bhi poori design kr di aur onBoarding step ko 6 bhi krdiya hai jisse active step 7 hogya hai
ab mein chahta hu ki pricing model pe wapis click ho toh hame saare feeded data mile toh uske liye ek get api aur bana lete hai ussi api mein jaake dekh

ab meine get bhi banadi hai aur sab shi se kaam krrha hai ab hume admin dashboard ke andr joh pending Vehicle Reviews hai usse update krna hai

since meine pricing banate waqt vehicle mein details add krke vehicle status pending krdiya tha toh ab mein admin ke andr dashboard wali api mein jaake pending vehicles ke andr unn vehicles ko get karunga jinka status pending hai aur saath mein unke owner ko populate bhi krdunga aur fir iss pendingVehicles ko response mein return krdunga

fir iss pendingVehicles ko fetch krlunga apne admin dashboard mein jaake aur isse daaldung setVehicleReviews mein toh hame pendingVehicleReviews mein dikhne lagega active 1 partner

ab iss pending vehicles ke review pe click krte hi us particular vehicle id pe chle jaane chhaiye aur fir wohi [id] folder ke andr page.tsx banao aur similarly iske andr data johki vehicle se aaayega uske liye api banao admin/review/vehicle/[id] ke andr route.ts ke andr aur issi mein patch bhi bna do jisse approve aur reject kroge

ab meine iski bhi poori functionality wagera bana di hai aur ab active step bhi 8 hogya hai yaani vehicle live bhi hogyi hai

ab doobara se nayi gmail se id bnayi hai taaki saare steps ek baar check hoske toh
ek issue ye aaya ki 3 step ke baad meine vehicle pending kari thi toh jab admin ke page pe gaya toh pending partner reviews mein toh 1 dikha hi rha tha balki saath mein pending vehicle reviews mein bhi 1 dikha rha tha toh isko solve krne ke liye mein dashboard ke route.ts mein ek aur condition laga di ki ye

const pricingCompletedPartners = await User.find({
role: "partner",
partnerOnBoardingSteps: { $gte: 6 }, mtlb woh partner jinke onboarding steps gte to 7 hai yaani pricing completed hai aur final review ke liye gaye hai
}).select("\_id");

    const pricingCompletedPartnerIds = pricingCompletedPartners.map(
      (p) => p._id, aur yaha hamne unn partners ki id store krli hai
    );

    const pendingVehicleReviews = await Vehicle.find({
      status: "pending",
      owner:{$in:pricingCompletedPartnerIds} aur yahi ids yaha dedi hai ki bas yahi partner chahiye jnke onboarding steps gte to 6 ho aur role partner ho aur vehicle ka status pending ho
    }).populate("owner");


    ab hamare partner ke saare onboardingsteps complete hichuke hai isliye ab hum chalenge booking functionality banane ke liye

    since hum logged in hai toh ham bokings pe click krke jaaenge seedha localhost:3000/book pe islke liye app ke andr user folder banao aur uske andr page.tsx banao

ab issi ke andr meine ui seekha joh ki thoda difficult tha jaise ki active step ko kaise find krte hai index ke base pe
aur iske andr ab mein seekh rha hu ki current location kaise find karunga jab mein location fixed icon pe click krunga tab jaake dekh page.tsx mein

ab current location toh seekh li meine kaise find krte hai but ab hame ye krna hai ki agr kisiko manually pickup location daalni ho toh use search mein likhte hi usse related suggestions aane lage aur ye kaam bhi api fetch krke hi hoga aur photon ki geocoding api hi kaam aaegi but abki baar search wali kaam aaegi toh chalo karte hai isse bhi

ab meine ye complete krne ke baad apna book page ka ui banaya hai aur isme hi meine seekha url banana jaake dekh joh mein continue ke time jis url pe bhej rha hu usme meinee kaafi details bheji hai jinhe mujhe access krna hai agle search ke page pe

ab mein search ka page banarha hu joh ki book ke andr ek folder banake banaunga

ab issi mein meine map show krane ke liye search map banaya hai jisme mein free map use krrha hu leaflet krke

iske liye we have to install npm i leaflet, iske baad npm i --save-dev @types/leaflet, aur iske baad npm i react-leaflet
ab leaflet ka map use krne ke liye iski inbuilt css ko import krna hoga layout.tsx mein jaake dekh {import "leaflet/dist/leaflet.css"}

initially hame map container lagane ke baad hame map nahi dikhega uske liye hume tile layer ke andr joh href hai usme ek openmap ka url milta hai hame woh nahi use krna ham usse remove krdenge aur ham use krenge ek CARTO karke map ka url hota hai usse jaake dekh

ab jab map hame dikhne laga with initial center location

toh ab hume iss map ko center krna hai apne pickup aur drop location pe jaake dekh

ab isme ek catch hai aur woh ye hai ki hame ek redirectCoords krke ek function banana hoga johki hamare p1 aur d1 pe jaake map ko redirect krde jaake dekh
ab humne apne map ko apne pickup aur drop ke hisaab se center krdiya hai but ab hume marker lagane honge ek pickup ke liye aur ek drop ke liye jaake dekh

ab icon bhi bnadiye hai aur ab hume krna ye hai ki hume longitude aur latitude chahiye uss route ke jaha se driver pickup location se drop location tak leke jaayega taaki ham ek black line dikha sake map mein uss particular route ke liye so iske liye bhi hame ek geocoding api lagegi jiska naam hai osrm api
{https://router.project-osrm.org/route/v1/driving/{pickupLng},{pickupLat};{dropLng},{dropLat}?overview=full&geometries=geojson}

ab meine loadRoute function banake usme route laake black route dikha diya hai map mein
ab mujhe apne markers ko draggable banana hai jisse ki user map mein markers ko drag krke location set krske iske liye marker ke andr jaake draggable likhdo

ab agr hum drag kre pickup ko toh mein chahta hu ki loadRoute waapis se call ho taaki route firse update hojaaye
humne ye bhi krdiya ab dono ke seperate function banake

ab mein chahta hu ki drag krne pr abhi toh map mein upate horha hai but saath mein jis nayi jagah pr leke gaye hai mark ko uss jagah ka complete address bhi toh store krana hoga na pickupLocation aur dropLocation mein aur wo hum krwayenge onchange mein value paas krke kyunki wohi hai joh search ke page.tsx mein searchMap se value leke jaarha hai iske liye.

ab hum ek api call krayenge joh lon aur lat leke complete address return karde aur ye kaam humne book ke andr pehle hi krwaya hai wahi se code laa aur searchMap mein paste krde

ab ye bhi hogya aur issike saath mera searchMap ka kaam poora hogya kaafi kuch seekhne ko mila isse hume but ab hum waapis badhte hai apne search ke page.tsx pe

iske baad meine search ke andr map ke neeche do div bnaye to show pickup and drop location

ab hume iske neeche vehicles ke card dikhane hai jitne bhi vehicles present hai uss pickup ke area ke aas paas
ab hum socket io seekhenge but but but hum wahanKaro folder ke andr hi nhi rkhenge isko isse bahar banayenge kyunki jab hum vercel pe wahanKaro ko deploy krenge tab socket io vercel pe utne acche se kaam nahi krega isliye hum socket io wale folder ko alag se render pe deploy krdenge

ab yaha se jaa socket.md pe

ab hum user model ke andr aur fields add krwayenge jaise location, socket id , online hai ya nahi jaake dekh
ab hum location ko set karayenge aur mongoDb mein store karayenge
but usse pehle hum socket io aur wahanKaro ko connect krna padega

wapis jaa socket.md pe
ab waha se toh io ko initialise krdiya hai but yaha connection banane ke liye lib ke andr socket.ts bana
ab hume socket.io-client ye package bhi install krna hoga

ab jaa socket.md mein

ab mein chahta hu ki jaise hi hum apni website pe aaye toh waise hi hum socket io se connect hojaaye
toh uske liye wahanKaro mein jaake hero section ke andr useeffect ka use kr
ab useeffect ke andr meine identity event bheja hai ab jaake socket ke index.js mein usse listen kr

hume mainly location ko update karana hai

ab hum useefect ko hero section mein nahi banayenge kyunki woh toh sirf user ke liye kaam krta,, hum ab ek component banayenge joh ki admin user partner teeno ke liye kaam krega

toh component ke andr jaake ek file bana GeoUpdater.tsx jisme hum apni location update krwayenge
aur ye groUpdater userId lega aur isse hum apni main Page.tsx mein lagadenge joh layout ke neeche hai uskke andr

ab mujhe ye socket id ko database mein store karana hai jaa wapis socket.md mein

ab hum nearbyVehicles find krenge aur uske liye hume api ke andr vehicles ke andr near-by ke andr route.ts banana hoga

ab humne nearby vehicles ki api banake usse book ke andr search page ke andr jaake fetch bhi krliya hai iss api ko aur ba hume card dikhane hai jisme vehicle ki image base fare ye sab show hoye
aur jab tak vehicle load hogi tab tak loading vehicle krke animation bhi aaye jaa search page pe dekh ab

ab meine woh problem bhi solve krdi hai joh aarhi thi jab hum pickup location ko door krde the but still vehicle show horhi thi

ab meine book pe click krne ke baad checkout pe jaane ke liye special url banaya hai khud but haa usko cleaner way mein aise bhi bana skte the
const url = new URLSearchParams({
pickup: pickupLocation,
drop: dropLocation,
vehicle: vehicle!,
driverId: i.owner.toString(),
fare: String(i.baseFare! + i.pricePerKm! \* km!),
pickupLat: String(pickupLat),
pickupLong: String(pickupLong),
dropLat: String(dropLat),
dropLong: String(dropLng),
mobile: String(mobile),
});

router.push(`/book/checkout?${url.toString()}`);

ab hum book folder ke andr jaake ek checkout folder banayenge aur uske andr page.tsx banayenge {basically ab hum apna checkout page design krenge}

ab meine filhaal checkout ke andr ui bana diya hai ab request ride pe click hone par booking hogi toh usse pehele hame ek booking model banana hai ki booking ke andr kya kya hoga toh jaa models ke andr booking.model.ts banale

ab meine booking model complete krdiya hai now i have to go to checkout page aur waha pe ye top pe likhde type Status =
| "idle"
| "requested"
| "awaiting_payment"
| "rejected"
| "expired"
| "cancelled"
| "payment"
| "confirmed";
ye ui mein status dikhayega but backend se iska lena dena nahi hai woh alag se handle krenge Booking status hum ye toh bas ui mein current status dikhane ke liye hai

ab ham booking ke liye api banayenge
jaao api folder mein booking folder banao aur uske andr pehle create folder banao aur uske andr route.ts file banao
ab meine create booking api banali hai aur ab jaake mujhe iss api ko fetch krwana hai apne checkout page pe jaake dekh handleRequestBooking ko

uske bad meine request ride pe click krke dekh liya aur apni booking ko create krliya hai
aur ab ye booking partner ke paas pending bookings mein jaaegi toh ab partner ke nav mein pending bookings krke option daal de jaake dekh partner nav ko

ab meine partner nav bhi banadiya hai aur usme do naye options add kiye hai ek pending request aur ek active ride
ab mujhe api bnani hogi joh pending request fetch kregi aur fir usse yaha ueefect ke andr fetch krke count update krwaunga
toh api ke andr partner ke andr bookings ke andr ek pending-requests-count krke folder bana joh sirf count krega ki kitni no.of pending requests hai hamare paas

ab meine iss api ko fetch bhi krliye hai partnernav mein
ab hame banana hai api ke andr partner ke andr bookings ke andr pending-requests johki actual request ka document dega poora jaao aur banao isse

ab meine ye api bhi banali hai toh ab jaa aur jaake pehle partner ke andr bookings folder bana aur uske andr pending-bookings folder bana aur usme fir page.tsx bana

ab meine banaliya page.tsx bhi aur iss api ko fetch bhi krliya hai now i have to make apis for accept ride and reject ride
ab iske liye api ke andr partner ke andr bookings mein dynamic route [id] bana aur uske andr accept aur reject folders bana aur un dono ki seperate route.ts bana
ab dynamic route isliye banaya hai taaki pata chale ki exactly kaunsi booking accept ya reject karni hai

ab meine accept aur reject bookings ki api banali hai ab chlke inhe fetch krna hai toh chl wapis se pending-requests ke page pe

ab inhe fetch bhi krliya hai aur ab ye kaam bhi krrhi hai properly

now hame user ke ui mein dikhana hoga ki jaise hi awaiting-payment status ho waise hi awaiting payment ka ui show ho uske liye mujhe api banani hogi active naam ke folder se bookings ke andr

ab iss api ko checkout page pe jaake fetchKaro aur useeffect ke andr call krwalo
ab meine fetch bhi krliya hai isse checkout page pe aur status ke andr store bhi krwaliya hai

ab mujhe issi checkout page pe different status ke liye ui design krna hai jaise abhi sirf idle status ke liye hi ui hai ab mujhe requested ke liye banana hai yaani jaise hi request ride pe click hoga toh kaisa ui dikhega aur jab ride accept hojaaegi tab awaiting payment ke liye kaisa ui dikhega ab ye sab banana hai mujhe toh chl wapis checkout page pe

ab meine requested ke ui ke case mein ek cancel request ka option de rakha hai toh ab uski bhi api banale jaa api ke andr booking ke andr [id] ke andr cancel-request api banale {since isse user cancel krrha hai isliye humne isse user ki booking mein banaya hai partner ki nahi aur haa isse [id] mein isliye banaya hai taaki hum \_id ki help se uss exact booking ko cancel krwaaske}

ab meine cancel bhi krwadiya
ab mujhe awaiting payment ke case ka ui banana tha joh ki meine bana bhi liya but usme ek catch tha ki jaise hi driver accepted ke neeche joh animation hai kind of loader wali toh woh animation 2 sec mein complete horhi hai aur mein chahta hu ki jaise hi animation complete ho waise hi hamara status awaiting payment se payment hojaye toh ye krne ke liye mujhe ek aur useefect banana hoga joh ki sirf tab chalega jab hamara status awaitng payment hai aur uss useeffect mein mein ek settimeout lagaunga joh ki 2 sec baad chalega
jaake dekh

ab ye krte hue ek dikkt aarh thi ki awaiting payment mein loader ke 2 sec baad ui hat jaata tha awaitng payment ka but firse wapis aajata tha toh usse claude ki help se aise theek kiya meine

My Mistake

Mera status backend API se aa raha tha:

const currentStatus =
res?.data?.bookingStatus ||
activeBooking?.bookingStatus ||
null;

Aur main directly:

setStatus(normalizedStatus as Status);

kar raha tha.

Problem ye thi ki API ki purani/slower response baad mein aa sakti thi. Example:

Latest status → payment
Old API response → awaiting_payment

Toh old response payment ko wapas awaiting_payment kar sakti thi.

Claude ne kaise solve kiya

useRef add kiya:

const statusRef = useRef<Status>("idle");

Aur ek function banaya:

const updateStatus = (nextStatus: Status) => {
statusRef.current = nextStatus;
setStatus(nextStatus);
};

Ab jab backend se new status milta hai, ye:

updateStatus(normalizedStatus);

dono update karta hai:

statusRef.current → latest status
status → UI ka status

Example:

Backend → awaiting_payment
↓
updateStatus("awaiting_payment")
↓
statusRef.current = awaiting_payment
status = awaiting_payment

Phir payment hone par:

statusRef.current = payment
status = payment
Old response ko rokna
if (
statusRef.current === "payment" &&
normalizedStatus === "awaiting_payment"
) {
return;
}

Iska matlab:

Agar latest status already payment hai, toh purani awaiting_payment API response ko ignore karo.

ab finally yaha tak mere select payment method tak ka ui ban gaya jisme do option hai ek cash aur ek online payment ab online payment ke liye razorpay ka setup krna hoga toh chl ab ye dekhte hai

ab sabse pehle chal aur api ke andr payment folder bna aur fir uske andr create folder aur usme route.ts bana

ab pehle npm i razorpay se razorpay ka package install kr
razorpay se payment create krwayenge aur fir uss payment ko verify bhi karwayenge 
razorpay use krne ke liye hame sabse pehle razorpay se uski key ID aur key secret leke aane honge

ab hume razorpay ki configuration karni hai apne project mein toh jaake dekh lib folder mein
ab configuration hone ke baad chalo aur api design karo razorpay ki payment creation ki

ab api create krdi hai aur ab chalo checkout page pe
ab checkout page pe hame pehle razorpay ki script ko load krna hoga dekh page.tsx mein
ab meine handleConfirmPayment function call kardiya hai but abhi hume handler function joh ki razorpay mein hai joh ki payment verify krega through payment verify api, bas usi ke liye hame apni api design krni hai ab

toh jaake payment mein verify ki api bana
ab meine api banali hai toh isse ab jaake checkout page pe razorpay ke handler function mein call krde

abhi humne apne online payment ke liye verify api banai hai but ab agr user cash option opt kkare toh uske liye bhi ek api banani hogi jisme bas booking confirm ho but payment status paid na dikhe

//ONE UPDATION
Pehle tu use kar raha tha:
- ❌ Photon API — photon.komoot.io/reverse
- Request fail ho rahi thi aur Network Error mil raha tha.
Ab tu use kar raha hai:
- ✅ Nominatim API — nominatim.openstreetmap.org/reverse
- Request successful hui aur address mil gaya.

ab hamara online payment hamne run krke bhi check krliya h aur woh ekdm shi chl rha hai ab hum agr cash option select krenge toh woh kaise hoga hame woh dkehna hai bas ab 
uske liye api mein booking ke andr [id] ke andr confirm krke ek folder banao aur usme route.ts bana

ab chalke iss api ko bhi call krwale checkout page pe hi 
aur ye call hogi handleConfirmPayment ke else block mein

ab humne cash ke case mein bhi api banake usko call krwaliya ur sab acche se kaam krrha hai

but abhi ek dikkt hai ki jab user ride request krta hai tab partner dashboard pe ride jaati toh hai but jab hum usse accept kre toh woh bookings page pe redirect hona chahiye aur reject kre toh page reload hona chahiye joh ki abhi nahi horha hai toh ab jaake woh kro pehle app mein partner ke andr pending-request mein page.tsx mein jaa aur isse sahi kr

ab humara payment ka saara maamla sorted hai and ab humari partner ki jitni bhi bookings hai unhe /partner/bookings pe jaake map karani hai toh partner folder mein ek naya bookings folder banao aur usme page.tsx banao

ab api mein jaake partner ke andr bookings ke andr route.ts banade jisme hum apni bookings ko feetch krenge saari

ab chalke iss api ko wahi apne bookings pe chalke fetch krlo
ab api ko fetch bhi krliya hai ab hum apna bookings page design krrhe hai partner wala
ab almost hamara partner bookings page bhi ready hai toh ab hum chlke yahi bookings ka page user ke liye bhi banayenge jisme usse bookings show hongi joh usne book ki hogi

ab hume user dashboard mein bookings show krni hai jaise humne partner dashboard mein show kri hai

iske liye pehle hame bookings ko get krna hoga joh bhi uss particular logged in user ne ki hai

abhi humne api design krli hai ab hum chalke isse fetch krenege /bookings page pe user dashboard mein

ab humne bookings page bhi banaliya hai user ka 
ab hume kuch real time events handle krenge socket io ke through
jaise abhi hum koi booking karte h user page se toh woh partner page pe turant reflect nahi krti balki hame page refresh krna padta hai partner dashboard pe tab jaake booking hame show hoti hia toh aisa na ho
hum chahte hai jaise hi user ne ride book ki waise hi partner dashboard pe booking show hojaaye

iske liye socketServer mein chalo aur index.js mein ek nayi common api design karo
iss api ko fetch kroge tum api ke andr booking ke andr create ke andr jaha booking create horhi hai uske just baad jaake dekh

ab humne api ko listen bhi toh krna hai abhi toh bas emit ki hai
isse hum listen krenge partner ke pending-requests ke page.tsx mein
ab humne isse listen bhi krliya

ab same issi common api ko ham accept api mein jaake bhi emit krenge kyunki real time mein hamne request ride pe partner dashboard mein booking toh show krdi but jaise hi partner ne ride accept ya reject ki woh bhi real time mein user ko show honi chahiye ki partner ne reject/accept kardiya hai
toh chal jaake api mein partner mein [id] ke andr accept ke andr jaake isse fetch kr

ab joh ye api banai hai usse jaake checkout page pe fetch kr
similarly hamne reject ke liye bhi krdiya uar dono hi sahi se kaam bhi karrhi hai

ab lage haath ham partner dashboard mein joh nav mein pending-request hai usme bhi real time mein count upate ho toh uske liye bhi hum fetch krenege nav ke andr jaake dekh

ab ye bhi hogya aur yaha humne mota mota saara socket io ka kaam nipta diya hai

ab hum finally chalenge apna active rides ka page design krne ki taraf
ab app ke andr partner ke andr active-rides karke folder banao

ab hume apni active-rides laane ke liye api banani padegi toh api ke andr partner ke andr ek my-active krke folder banao aur usme fir active-rides ko fetch kro

ab partner ke andr active-rides folder banao aur iss bani hui api ko fetch krlo wha pe 
ab iss page pe hame driver ki position, pickUp aur drop ye sab bhi chahiyhe hoga aur ye array hoga do numbers ka that is latitude and longitude

pickUp aur drop toh hum booking model se le lenge but for driver Current Position we have to use wo navigatr wala funda jaake dekh

ab itna krne ke baad ek LiveRideMap component banao jisme poori ki poori SearchMap component ki div chep de
ab meine kaafi changes kiye hai searchMap ke comparison mein LiveRideMap mein
ab mujhe LiveRideMap mein routes dikhane hai but they will depend on the bookingStatus
initially bookingStatus is confirmed toh driver aur pickUp ke beech route show hoga 
jaise hi driver phoch jaaega pickUp aur ride ka status started krega toh fir pickUp aur drop ke beech route show hoga aur jab drop krdega driver toh status completed krdega 

ab ye route bana rha hu mein jaake dekh live ride map mein useeffect ke andr
ab mein active ride page design krrha hu jaake dekh usme mein kaise estimatedTimeTOPickUp, estimatedTimeTODrop,distanceTOPickUp,distanceToDrop kaise leke aarha hu liveRideMap se

in sab ko mein liveRideMap mein set krrha hu in fetchRoutes function which is inside the useffect hook jaake dekh

ab hum ek component banarhe hai jisse hume multiple jagah use krna hoga PanelContent.tsx naam se but sabse pehle ye active ride page mein use hoga

abhi panel contents mein jab mein activeBookings[0].user.name krrha tha toh name nahi aarha tha kyuki active ride ki api mein ham populate nahi krrhe the user ko toh meine woh sahi kiya jaake dekhle

jaise humne STATUS_LABEL ki array banai thi active ride mein waise hi paymentStatus dikhane ke liye bhi banayenge PAYMENT_BADGE krke jaake dekh active rides mein

ab active rides mein hi meine ek canChat flag banadiya hai jisse hume pata chale ki kab chat allowed hai

ab active ride mein hi ek usestate banana hoga jisme likha hoga chatOpen setChatOpen initially false hoga
aur isse toggle krne ke liye onChatToggle naam se function bhi bnayenge aur inn dono ko panelContents mein bhej denge

ab hume RideChat.tsx naam se component banana hoga jisme hum chat krayenge aurr ye panelComponents men import krna hoga

ab hume userRole chahiye hoga toh woh toh hum redux store se leke aate hai toh dekh jaake PanelContents mein

ab ye sab bhi hogya hai hamara aur hamne current role isliye li thi kyunki hame usse ride chat mein bhejna tha kyunki role ke basis pe hi chat kaam karegi

ab chalke RideChat page ko design kar
ab iske liye hame chatModel banana padega jaake dekh model folder mein

ab humne apna chatModel banaliya hai toh ab hum chalke api mein ek folder banayenge chat naam se aur usme saari chatbox se related api banayenge
isme sabse pehle ham send api banayenge jaake dekh jisme hamara message create hoga
ab doosri api banayenge get-all jisme saare message get krenge

ab hum ek api banayenge ai-suggestions ke liye aur isme ham gemini ki api ka use krenge
ye api bhi design hogy ab chat ki saari api's ko chalke fetch kr apne ride chat ke component mein dekh jaae usse pehle kuch states bhi bnani padegi woh bhi dekh

sara kuch hone ke baad meri ai suggestions api kaam nahi krrhi thi kyunki uska response nikalne ka alg treeka tha jiss model ko mein use krrha hu aur mein virtual code ke gemini model ke hisaab se response nikal rha tha isliye api ko complete gpt se banwake le aaya mein

ab hogya hamara ai chat box complete aur ab hum chalenge apne iss active ride page ko responsive banane ki taraf
isme ham ek state banayenge active-ride page mein expanded,setExpanded banake agr expanded true hoga toh hamara mobile mien 82vh tak white div dikhega jisme saari details hongi aur agr false hoga toh sirf 142 px tk dikhega

hamne responsive bhi banadiya hai ab apna active ride page toh ab hame same active ride ka page user ke liye bhi banana hai toh poora copy krke user wale mein paste karde
but user ke paas toh bhot saari booking ho toh bookingId ke basis pe active ride page show krna hoga

ab humne user ke liye bhi active-rides design krliya hai but abhi isme ek major point baaki hai
hamare partner ke active-rides mein ham drive ki pos ke liye useffect ke andr wahi navigator.geolocation ka use krrhe the
but user ke case mein driver ki pos ke liye hame use krna hoga socket.io ka taaki real time driver ki position user ko dikhe aur pata chale ki driver kaha tak phocha
iske liye partner ki ative ride pe chalo aur uske useeffect ke andr ek event emit kro jisme ham lon,lat bookingId,bookingStatus bhejenge aur usse user pe aake listen karlo

ye nahi krna hai balki ham user aur partner dono ko ek hi room mein join krwadenge same bookingId wale
iske liye sabse pehle user se ek join-room karke event emit karenge aur similarly partner se bhi aur ye ham dono ke active-ride page pe hi krenge useeffect ke andr
ab jab dono jagah se event emit krdiya hai toh inhe ek common place pe listen bhi krna padega toh iske liye go to socketServer folder aur uski index.js mein iss event ko listen krlo